import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { WelcomeComponent } from './welcome/welcome.component';
 
export const routes: Routes = [
  { path:'login', component: LoginComponent },
  { path:'register', component: RegisterComponent },
  { path:'welcome', component: WelcomeComponent },
  { path:'', redirectTo:'login', pathMatch:'full' },
  { path:'**', redirectTo:'login' } // catch-all
];