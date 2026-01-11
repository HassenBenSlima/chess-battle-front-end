import { Injectable } from '@angular/core';
import { Stomp, CompatClient } from '@stomp/stompjs';
import SockJS from 'sockjs-client'; // ✅ import corrigé

@Injectable({ providedIn: 'root' })
export class WsService {

  private stompClient!: CompatClient;

  connect(onUsersUpdate: (users: string[]) => void, onInvite: (inv: any) => void) {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');

      // Liste des joueurs connectés
      this.stompClient.subscribe('/topic/users', (message: any) => {
        onUsersUpdate(JSON.parse(message.body));
      });

      // Invitations reçues
      const me = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).username : '';
      this.stompClient.subscribe(`/topic/invite/${me}`, (message: any) => {
        onInvite(JSON.parse(message.body));
      });
    });
  }

  sendInvite(from: string, to: string) {
    const payload = { from, to };
    this.stompClient.send('/app/invite', {}, JSON.stringify(payload));
  }
}