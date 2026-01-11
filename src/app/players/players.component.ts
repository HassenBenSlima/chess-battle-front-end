// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AuthWsService, Invitation, User } from '../services/auth-ws.service';
// import { ReactiveFormsModule } from '@angular/forms';
//
// @Component({
//   selector: 'app-players',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './players.component.html',
//   styleUrls: ['./players.component.scss']
// })
// export class PlayersComponent implements OnInit {
//
//   me!: string;
//   players: string[] = [];
//   invitations: Invitation[] = [];
//
//   constructor(private authWs: AuthWsService) {}
//
//   ngOnInit(): void {
//     const user = this.authWs.getUser();
//     if (!user) return;
//     this.me = user.username;
//
//     // Connecter WebSocket
//     this.authWs.connectWebSocket();
//
//     // S’abonner aux joueurs en ligne
//     this.authWs.onlineUsers$.subscribe(users => {
//       // Supprime moi-même de la liste
//       this.players = users
//         .map(u => u.username)
//         .filter(u => u !== this.me);
//     });
//
//     // S’abonner aux invitations reçues
//     this.authWs.invitations$.subscribe(invites => {
//       this.invitations = invites;
//     });
//   }
//
//   invite(player: string) {
//     this.authWs.sendInvitation(player);
//     alert(`Invitation envoyée à ${player}`);
//   }
//
//   accept(invite: Invitation) {
//     this.authWs.acceptInvitation(invite);
//     alert(`Vous avez accepté l'invitation de ${invite.from}`);
//     // TODO: lancer la partie et afficher le plateau d'échecs
//   }
// }
