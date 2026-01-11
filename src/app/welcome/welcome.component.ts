import { Component } from '@angular/core';
import {AuthService} from '../services/AuthService';

@Component({
  selector: 'app-welcome',
  imports: [],
  standalone: true,

  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {


  user:any;

  constructor(private auth:AuthService){
    this.user = auth.getUser();
  }
}
