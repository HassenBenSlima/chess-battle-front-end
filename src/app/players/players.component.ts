import {Component} from '@angular/core';
import {WsService} from '../services/wsService';
import {AuthService} from '../services/AuthService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-players',
  imports: [CommonModule],
  templateUrl: './players.component.html',
  standalone: true,

  styleUrl: './players.component.scss'
})
export class PlayersComponent {
  me!: string;
  players: string[] = [];
  invitations: any[] = [];

  constructor(private ws: WsService, private auth: AuthService) {
  }

  ngOnInit() {
    const user = this.auth.getUser();
    if (!user) return;
    this.me = user.username;

    // Connect WebSocket
    this.ws.connect(
      (users: string[]) => {
        // Supprime moi-même de la liste
        this.players = users.filter(u => u !== this.me);
      },
      (invite: any) => {
        // Notification d’invitation reçue
        const accept = confirm(`${invite.from} vous invite à jouer. Accepter ?`);
        if (accept) {
          alert(`Invitation de ${invite.from} acceptée !`);
          // TODO: lancer la partie
        } else {
          alert(`Invitation de ${invite.from} refusée`);
        }
      }
    );
  }

  invite(player: string) {
    this.ws.sendInvite(this.me, player);
    alert(`Invitation envoyée à ${player}`);
  }
}
