import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import {provideHttpClient} from '@angular/common/http';  // ✅ <--- IMPORT MANQUANT

/*
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
*/
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),       // routing
    provideHttpClient()          // HttpClient pour AuthService
  ]
}).catch(err => console.error(err));
