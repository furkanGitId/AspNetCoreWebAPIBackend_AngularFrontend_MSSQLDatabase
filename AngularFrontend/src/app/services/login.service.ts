import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';

import { environment } from '../../environments/environments';
import { AuthService } from './auth.service';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // call API, return full response observable
  login(payload: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.api.login, payload)
      .pipe(
        tap(resp => {
          if (resp?.token) {
            // persist token via AuthService
            this.authService.setToken(resp.token);
            // schedule token refresh
            //this.scheduleTokenRefresh();
          }
        }),
        catchError(err => {
          return throwError(() => err);
        })
      );
  }

  // refreshToken(): Observable<LoginResponse> {
  //   return this.http.post<LoginResponse>(environment.api.refreshToken, {})
  //     .pipe(
  //       tap(resp => {
  //         if (resp?.token) {
  //           this.authService.setToken(resp.token);
  //         }
  //       }),
  //       catchError(err => {
  //         this.authService.logout();
  //         return throwError(() => err);
  //       })
  //     );
  // }

  //scheduleTokenRefresh() {
  //   const ms = this.authService.getTokenExpiryTime();
  //   if (!ms) return;

  //   const refreshBefore = ms - 60000; // refresh 1 minute before expiry

  //   if (refreshBefore > 0) {
  //     setTimeout(() => {
  //       this.refreshToken().subscribe(() => {
  //         this.scheduleTokenRefresh(); // schedule again for new token
  //       });
  //     }, refreshBefore);
  //   }
  // }
}