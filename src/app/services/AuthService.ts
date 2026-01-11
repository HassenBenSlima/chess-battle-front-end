import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface Invitation {
  from: string;
  to: string;
}

export interface Move {
  fromPos: string;
  toPos: string;
  player?: string; // 'white' or 'black'
  timestamp?: string;
}

export interface Game {
  id: number;
  whitePlayer: string;
  blackPlayer: string;
  currentPlayer: 'white' | 'black';
  status: string;
  winner?: string;
  created_at?: string;
}

export interface GameMoveResponse {
  moves: Move[];
  nextPlayer: 'white' | 'black';
}


@Injectable({ providedIn: 'root' })
export class AuthWsService {
  private api = 'http://localhost:8080/api/auth';
  private stompClient: Stomp.Client;
  private connected = false;

  // Observables
  onlineUsers$ = new BehaviorSubject<string[]>([]);
  invitations$ = new BehaviorSubject<Invitation[]>([]);
  gameCreated$ = new BehaviorSubject<Game | null>(null);

  gameId$ = new BehaviorSubject<number | null>(null);

  moves$ = new BehaviorSubject<Move[]>([]);
  user$ = new BehaviorSubject<any>(this.getUser());
  currentPlayerTurn$ = new BehaviorSubject<'white' | 'black'>('white');
  gameMoves$ = new BehaviorSubject<Move[]>([]);
 
  constructor(private http: HttpClient) {
    // Initialize STOMP client
    this.stompClient = new Stomp.Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP: ' + str), // Optional debugging
    });
  }

  // ==================== REST API ====================
  login(data: any) {
    return this.http.post(`${this.api}/login`, data).pipe(
      tap((u: any) => {
        this.setUser(u);
        this.connectWebSocket();
      })
    );
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  getOnlineUsers() {
    return this.http.get(`${this.api}/online`);
  }

  // ==================== USER MANAGEMENT ====================
  private setUser(u: any) {
    localStorage.setItem('user', JSON.stringify(u));
    this.user$.next(u);
  }

  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  isLogged() {
    return !!this.getUser();
  }

  observeUser() {
    return this.user$.asObservable();
  }

  logout() {
    localStorage.removeItem('user');
    this.user$.next(null);
    this.disconnectWebSocket();
  }

  // ==================== WEBSOCKET CONNECTION ====================
  connectWebSocket() {
    const user = this.getUser();
    if (!user || this.connected) return;

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket:', frame);
      this.connected = true;

      // Subscribe to topics
      this.subscribeToTopics(user.username);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
      this.connected = false;
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.connected = false;
    };

    this.stompClient.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this.connected = false;
    };

    // Activate the connection
    this.stompClient.activate();
  }

  

  disconnectWebSocket() {
    if (this.stompClient && this.connected) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }

  // ==================== GAME ACTIONS ====================
  sendInvite(to: string) {
    const from = this.getUser()?.username;
    if (!from || !this.connected) return;

    const invitation: Invitation = { from, to };
    this.stompClient.publish({
      destination: '/app/invite',
      body: JSON.stringify(invitation),
    });
  }

  acceptInvite(invitation: Invitation) {
    if (!this.connected) return;

    this.stompClient.publish({
      destination: '/app/accept',
      body: JSON.stringify(invitation),
    });

    // Remove the invitation from local list
    const current = this.invitations$.value.filter(
      (inv) => !(inv.from === invitation.from && inv.to === invitation.to)
    );
    this.invitations$.next(current);
  }

  refuseInvite(invitation: Invitation) {
    // You might want to create a separate endpoint for this
    console.log('Refusing invitation:', invitation);

    // Remove from local list
    const current = this.invitations$.value.filter(
      (inv) => !(inv.from === invitation.from && inv.to === invitation.to)
    );
    this.invitations$.next(current);
  }

  sendMove(gameId: number, fromPos: string, toPos: string) {
    if (!this.connected) return;

    const move: Move = { fromPos, toPos };
    this.stompClient.publish({
      destination: `/app/move/${gameId}`,
      body: JSON.stringify(move),
    });

    // Subscribe to game moves if not already subscribed
    this.subscribeToGameMoves(gameId);
  }

   

  // ==================== UTILITY ====================
  getConnectionStatus() {
    return this.connected;
  }

  private subscribeToTopics(username: string) {
    // Subscribe to online users
    this.stompClient.subscribe('/topic/users', (message) => {
      const users: string[] = JSON.parse(message.body);
      this.onlineUsers$.next(users);
    });

    // Subscribe to invitations
    this.stompClient.subscribe('/topic/invitations', (message) => {
      const invitation: Invitation = JSON.parse(message.body);
      if (invitation.to === username) {
        const currentInvitations = this.invitations$.value;
        this.invitations$.next([...currentInvitations, invitation]);
      }
    });

    // Subscribe to game created
    this.stompClient.subscribe(`/topic/game-created/${username}`, (message) => {
      const game: Game = JSON.parse(message.body);
      this.gameCreated$.next(game);
      console.log('Game created:', game);
      
      // Determine if current user is white or black
      const currentUser = this.getUser()?.username;
      const myColor = this.getMyColor(game, currentUser);
      console.log(`I am playing as: ${myColor}`);
      
      // Subscribe to game moves
      this.subscribeToGameMoves(game.id);
    });
  }

  subscribeToGameMoves(gameId: number) {
    const topic = `/topic/game/${gameId}`;
    
    this.stompClient.subscribe(topic, (message) => {
      const response: GameMoveResponse = JSON.parse(message.body);
      this.gameMoves$.next(response.moves);
      this.currentPlayerTurn$.next(response.nextPlayer);
      console.log('Next player:', response.nextPlayer);
    });
  }

  // Helper method to determine user's color
  getMyColor(game: Game, username: string): 'white' | 'black' | 'spectator' {
    if (game.whitePlayer === username) return 'white';
    if (game.blackPlayer === username) return 'black';
    return 'spectator';
  }

  // Check if it's current user's turn
  isMyTurn(game: Game): boolean {
    if (!game) return false;
    
    const currentUser = this.getUser()?.username;
    const myColor = this.getMyColor(game, currentUser);
    
    return game.currentPlayer === myColor;
  }

  // Get opponent's username
  getOpponent(game: Game): string {
    const currentUser = this.getUser()?.username;
    if (game.whitePlayer === currentUser) {
      return game.blackPlayer;
    } else {
      return game.whitePlayer;
    }
  }
}
