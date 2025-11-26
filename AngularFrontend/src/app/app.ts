import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './services/login.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-app');

  constructor(private authService: AuthService, private loginService: LoginService) { }

  ngOnInit(): void {
    // If token exists and is still valid, start silent refresh
    if (this.authService.isTokenValid()) {
      //this.loginService.scheduleTokenRefresh();
    }
  }
}
