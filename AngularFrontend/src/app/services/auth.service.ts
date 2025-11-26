import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'token';
  constructor(
    private jwtHelper: JwtHelperService
  ) { }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // decode token safely
  decodeToken(token?: string) {
    const t = token ?? this.getToken();
    if (!t) return null;
    try {
      return this.jwtHelper.decodeToken(t);
    } catch {
      return null;
    }
  }

  // check if token exists and not expired
  isTokenValid(): boolean {
    const t = this.getToken();
    if (!t) return false;
    return !this.jwtHelper.isTokenExpired(t);
  }

  getTokenExpiryTime(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = this.decodeToken(token);
      if (!decoded?.exp) return null;

      const expiry = decoded.exp * 1000; // convert seconds to ms
      const now = Date.now();
      const remaining = expiry - now;

      return Math.max(0, remaining);
    } catch {
      return null;
    }
  }
}