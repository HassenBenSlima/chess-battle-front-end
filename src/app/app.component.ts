import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
   selector: 'app-root',
  standalone: true,           // <-- nécessaire pour standalone
  imports: [RouterOutlet],     // <-- ici c’est correct
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'chess-battle';
}
