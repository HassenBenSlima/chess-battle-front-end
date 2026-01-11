import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { WelcomeComponent } from './welcome/welcome.component';
import {AuthGuard} from './guard/auth.guard';

export const routes: Routes = [
  { path:'login', component: LoginComponent },
  { path:'register', component: RegisterComponent },
  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [AuthGuard]  // Protected route
  },
  { path:'', redirectTo:'login', pathMatch:'full' },
  { path:'**', redirectTo:'login' } // catch-all
];
