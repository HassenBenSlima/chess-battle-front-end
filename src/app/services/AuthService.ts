import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, tap} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:8080/api/auth';

  private currentUser$ = new BehaviorSubject<any>(this.getUser());

  constructor(private http: HttpClient) {}

  // ================= API =================

  login(data:any){
    return this.http.post(this.api + '/login', data).pipe(
      tap(user => this.setUser(user))
    );
  }

  register(data:any){
    return this.http.post(this.api + '/register', data);
  }

  // ================= SESSION =================

  private setUser(user:any){
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser$.next(user);
  }

  getUser(){
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  isLogged(){
    return !!this.getUser();
  }

  logout(){
    localStorage.clear();
    this.currentUser$.next(null);
  }

  observeUser(){
    return this.currentUser$.asObservable();
  }
}
