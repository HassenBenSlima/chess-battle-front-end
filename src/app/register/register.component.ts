import {Component, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../services/AuthService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './register.component.html',
  standalone: true,

  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  form: any;

  error = '';
  success = '';

  constructor(private fb: FormBuilder,
              private auth: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  register() {
    if (this.form.invalid) return;

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.success = "Account created successfully";
        setTimeout(() => this.router.navigateByUrl('/login'), 1200);
      },
      error: () => this.error = "Username already exists",
    });
  }
}
