import { CommonModule } from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import {AuthWsService} from '../services/AuthService';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss'
})
export class ChessBoardComponent implements OnInit {
  @Input() gameId!: number;

  board = Array(8).fill(0).map(()=>Array(8).fill(''));

  constructor(private ws:AuthWsService){}

  move(from:string,to:string){
    this.ws.sendMove(this.gameId, from, to);
  }

  ngOnInit(): void {
  }
}

