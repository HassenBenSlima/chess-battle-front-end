import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
 import { AuthWsService } from '../services/AuthService';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthWsService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
