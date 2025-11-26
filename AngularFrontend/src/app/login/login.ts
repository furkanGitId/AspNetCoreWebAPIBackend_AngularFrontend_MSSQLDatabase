import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { login } from '../models/login.model';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
})
export class LoginComponent {
  credentials: login = {
    username: '',
    password: '',
  };

  constructor(
    private loginService: LoginService,
    private router: Router,
    private authService: AuthService
  ) { }

  login() {
    const payload = {
      username: this.credentials.username,
      password: this.credentials.password
    };

    this.loginService.login(payload).subscribe({
      next: (response) => {
        this.credentials.token = response.token;
        const decoded = this.authService.decodeToken(response.token);
        if (this.authService.isTokenValid()) {
          this.credentials.errorMessage = '';
          // navigate to protected route
          this.router.navigate(['/user']);
        } else {
          this.credentials.errorMessage = 'Token is invalid or expired.';
        }
      },
      error: (err) => {
        // set user-friendly message
        this.credentials.errorMessage = err?.error?.message ?? 'Login failed. Check credentials.';
      }
    });
  }
}
