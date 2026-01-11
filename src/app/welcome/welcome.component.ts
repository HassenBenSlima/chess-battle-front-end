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
  onlineUsers: string[] = [];
  invitations: Invitation[] = [];
  game: any = null;
  currentUser: any;

  private subscriptions: Subscription = new Subscription();

  constructor(private auth: AuthWsService) {
    this.currentUser = this.auth.getUser();
  }

  ngOnInit() {
    this.loadUsers();

    if (this.currentUser) {
      this.auth.connectWebSocket();
    }

    // Subscribe to game creation
    this.subscriptions.add(
      this.auth.gameCreated$.subscribe((game: any) => {
        if (game) {
          this.game = game;
          console.log('Game started:', game);
        }
      })
    );

    // Subscribe to invitations
    this.subscriptions.add(
      this.auth.invitations$.subscribe((invitations: Invitation[]) => {
        this.invitations = invitations;
      })
    );

    // Subscribe to online users
    this.subscriptions.add(
      this.auth.onlineUsers$.subscribe((users: string[]) => {
        this.onlineUsers = users.filter(u => u !== this.currentUser?.username);
      })
    );
  }

  loadUsers() {
    this.auth.getOnlineUsers().subscribe({
      next: (users: any) => {
        if (Array.isArray(users)) {
          this.onlineUsers = users
            .filter((u: any) => u.username !== this.currentUser?.username)
            .map((u: any) => u.username || u);
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
  }

  refuse(invitation: Invitation) {
    this.auth.refuseInvite(invitation);
  }

  leaveGame() {
    this.game = null;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
