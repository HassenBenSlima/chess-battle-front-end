import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
 import {Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthWsService } from '../services/AuthService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // ✅ pluriel
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  error = '';

  constructor(private fb: FormBuilder,
              private auth: AuthWsService,
              private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Initialization logic if needed
  }

  login() {
    if (this.form.invalid) return;

    this.auth.login(this.form.value).subscribe({
      next: (u: any) => {
        this.router.navigateByUrl('/welcome');
      },
      error: () => this.error = "Invalid username or password"
    });
  }
}
