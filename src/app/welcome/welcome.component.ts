import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthWsService, Invitation } from '../services/AuthService';
import { CommonModule } from '@angular/common';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, ChessBoardComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit, OnDestroy {
  gameStarted = false;

  onlineUsers: string[] = [];
  invitations: Invitation[] = [];
  currentUser: any;

  invites$: Observable<Invitation[]>;
  gameId$: Observable<number | null>;
  users$: Observable<string[]>;

  private subscriptions: Subscription = new Subscription();

  constructor(private auth: AuthWsService) {
    this.currentUser = this.auth.getUser();

    // Initialize observables
    this.invites$ = this.auth.invitations$;
    this.users$ = this.auth.onlineUsers$;
    this.gameId$ = this.auth.gameId$;
  }

  ngOnInit() {
    this.loadUsers();

    // Connect WebSocket AFTER getting user data
    if (this.currentUser) {
      this.auth.connectWebSocket();
    }

    // Subscribe to observables
    this.subscriptions.add(
      this.gameId$.subscribe((id: number | null) => {
        this.gameStarted = !!id;
        if (id) {
          console.log('Game started with ID:', id);
        }
      })
    );

    this.subscriptions.add(
      this.invites$.subscribe((invitations: Invitation[]) => {
        this.invitations = invitations;
        console.log('Invitations updated:', invitations);
      })
    );

    this.subscriptions.add(
      this.users$.subscribe((users: string[]) => {
        // Filter out current user
        this.onlineUsers = users.filter(u => u !== this.currentUser?.username);
        console.log('Online users updated:', this.onlineUsers);
      })
    );
  }

  loadUsers() {
    this.auth.getOnlineUsers().subscribe({
      next: (users: any) => {
        if (Array.isArray(users)) {
          this.onlineUsers = users
            .filter((u: any) => u.username !== this.currentUser?.username)
            .map((u: any) => u.username || u); // Extract username if it's an object
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  invite(user: string) {
    if (this.currentUser?.username !== user) {
      this.auth.sendInvite(user);
    }
  }

  accept(invitation: Invitation) {
    this.auth.acceptInvite(invitation);
    // Remove from local list
    this.invitations = this.invitations.filter(
      inv => !(inv.from === invitation.from && inv.to === invitation.to)
    );
  }

  refuse(invitation: Invitation) {
    this.auth.refuseInvite(invitation);
    // Remove from local list
    this.invitations = this.invitations.filter(
      inv => !(inv.from === invitation.from && inv.to === invitation.to)
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }
}
