import { CommonModule } from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import {AuthWsService, Game, Move} from '../services/AuthService';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.scss'
})
export class ChessBoardComponent implements OnInit {
  @Input() game!: Game;

  files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  moves: Move[] = [];
  selectedSquare: string | null = null;
  possibleMoves: string[] = [];
  boardFlipped = false;

  myColor: 'white' | 'black' | 'spectator' = 'spectator';
  isMyTurn = false;
  opponent = '';

  private movesSubscription!: Subscription;
  private turnSubscription!: Subscription;

  constructor(private authService: AuthWsService) {}

  ngOnInit() {
    if (this.game) {
      this.initializeGame();

      // Subscribe to moves
      this.movesSubscription = this.authService.gameMoves$.subscribe(
        (moves: Move[]) => {
          this.moves = moves;
          this.updateGameState();
        }
      );

      // Subscribe to turn changes
      this.turnSubscription = this.authService.currentPlayerTurn$.subscribe(
        (currentPlayer: 'white' | 'black') => {
          this.game.currentPlayer = currentPlayer;
          this.updateGameState();
        }
      );
    }
  }

  initializeGame() {
    const currentUser = this.authService.getUser()?.username;
    this.myColor = this.authService.getMyColor(this.game, currentUser);
    this.opponent = this.authService.getOpponent(this.game);
    this.isMyTurn = this.authService.isMyTurn(this.game);

    // Flip board if user is black
    this.boardFlipped = this.myColor === 'black';
  }

  updateGameState() {
    const currentUser = this.authService.getUser()?.username;
    this.isMyTurn = this.authService.isMyTurn(this.game);

    // Update last move highlights
    if (this.moves.length > 0) {
      const lastMove = this.moves[this.moves.length - 1];
      // You can store last move for highlighting
    }
  }

  onSquareClick(square: string) {
    if (!this.isMyTurn) {
      alert(`It's ${this.opponent}'s turn!`);
      return;
    }

    if (this.selectedSquare === square) {
      // Deselect
      this.selectedSquare = null;
      this.possibleMoves = [];
    } else if (this.selectedSquare) {
      // Make move
      this.authService.sendMove(this.game.id, this.selectedSquare, square);
      this.selectedSquare = null;
      this.possibleMoves = [];
    } else {
      // Select piece
      const piece = this.getPieceAt(square);
      if (piece && this.isMyPiece(piece, square)) {
        this.selectedSquare = square;
        this.calculatePossibleMoves(square, piece);
      }
    }
  }

  isMyPiece(piece: string, square: string): boolean {
    // Check if piece belongs to current player
    const isWhitePiece = piece === piece.toUpperCase();
    return (this.myColor === 'white' && isWhitePiece) ||
      (this.myColor === 'black' && !isWhitePiece);
  }

  calculatePossibleMoves(square: string, piece: string) {
    // Simplified move calculation
    this.possibleMoves = [];

    const file = square[0];
    const rank = parseInt(square[1]);

    // Different move patterns for different pieces
    switch(piece.toLowerCase()) {
      case 'p': // Pawn
        const direction = this.myColor === 'white' ? 1 : -1;
        this.possibleMoves.push(file + (rank + direction));
        if ((this.myColor === 'white' && rank === 2) ||
          (this.myColor === 'black' && rank === 7)) {
          this.possibleMoves.push(file + (rank + 2 * direction));
        }
        break;

      case 'n': // Knight
        const knightMoves = [
          {df: 2, dr: 1}, {df: 2, dr: -1},
          {df: -2, dr: 1}, {df: -2, dr: -1},
          {df: 1, dr: 2}, {df: 1, dr: -2},
          {df: -1, dr: 2}, {df: -1, dr: -2}
        ];
        this.calculateMovesFromOffsets(square, knightMoves);
        break;
    }
  }

  calculateMovesFromOffsets(square: string, offsets: {df: number, dr: number}[]) {
    const file = square[0];
    const rank = parseInt(square[1]);

    for (const offset of offsets) {
      const newFile = String.fromCharCode(file.charCodeAt(0) + offset.df);
      const newRank = rank + offset.dr;

      if (newFile >= 'a' && newFile <= 'h' && newRank >= 1 && newRank <= 8) {
        this.possibleMoves.push(newFile + newRank);
      }
    }
  }

  isPossibleMove(square: string): boolean {
    return this.possibleMoves.includes(square);
  }

  isMoveFromSquare(square: string): boolean {
    if (this.moves.length === 0) return false;
    const lastMove = this.moves[this.moves.length - 1];
    return lastMove.fromPos === square;
  }

  isMoveToSquare(square: string): boolean {
    if (this.moves.length === 0) return false;
    const lastMove = this.moves[this.moves.length - 1];
    return lastMove.toPos === square;
  }

  isCurrentMove(square: string | undefined): boolean {
    return false; // Implement based on your needs
  }

  getPieceAt(square: string): string {
    // Initial chess setup
    const rank = parseInt(square[1]);
    const file = square[0];

    // White pieces (uppercase)
    if (rank === 1) {
      const whiteBackRank: {[key: string]: string} = {
        'a': 'R', 'b': 'N', 'c': 'B', 'd': 'Q',
        'e': 'K', 'f': 'B', 'g': 'N', 'h': 'R'
      };
      return whiteBackRank[file] || '';
    }
    if (rank === 2) return 'P';

    // Black pieces (lowercase)
    if (rank === 8) {
      const blackBackRank: {[key: string]: string} = {
        'a': 'r', 'b': 'n', 'c': 'b', 'd': 'q',
        'e': 'k', 'f': 'b', 'g': 'n', 'h': 'r'
      };
      return blackBackRank[file] || '';
    }
    if (rank === 7) return 'p';

    return '';
  }

  getPieceSymbol(square: string): string {
    const piece = this.getPieceAt(square);
    const symbols: {[key: string]: string} = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return symbols[piece] || piece;
  }

  isWhitePiece(square: string): boolean {
    const piece = this.getPieceAt(square);
    return piece === piece.toUpperCase() && piece !== '';
  }

  isBlackPiece(square: string): boolean {
    const piece = this.getPieceAt(square);
    return piece === piece.toLowerCase() && piece !== '';
  }

  flipBoard() {
    this.boardFlipped = !this.boardFlipped;
    this.files = this.boardFlipped ? [...this.files].reverse() : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    this.ranks = this.boardFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  }

  getMovePairs(): {white?: Move, black?: Move}[] {
    const pairs = [];
    for (let i = 0; i < this.moves.length; i += 2) {
      pairs.push({
        white: this.moves[i],
        black: this.moves[i + 1]
      });
    }
    return pairs;
  }

  resign() {
    if (confirm('Are you sure you want to resign?')) {
      // Implement resign logic
      console.log(`${this.myColor} resigned`);
    }
  }

  offerDraw() {
    // Implement draw offer
    console.log('Draw offered');
  }

  undoMove() {
    // Implement undo logic
    console.log('Undo requested');
  }

  ngOnDestroy() {
    if (this.movesSubscription) this.movesSubscription.unsubscribe();
    if (this.turnSubscription) this.turnSubscription.unsubscribe();
  }
}

