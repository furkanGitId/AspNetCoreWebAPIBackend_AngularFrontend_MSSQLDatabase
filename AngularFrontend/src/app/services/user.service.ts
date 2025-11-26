import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    // Auth header is attached by AuthInterceptor registered in app config
    return this.http.get<User[]>(environment.api.user);
  }

  getUsersbyId(id: number): Observable<User[]> {
    // Auth header is attached by AuthInterceptor registered in app config
    return this.http.get<User[]>(`${environment.api.user}/${id}`);
  }

  deleteById(id: number): Observable<User[]> {
    // Auth header is attached by AuthInterceptor registered in app config
    return this.http.delete<User[]>(`${environment.api.user}/${id}`);
  }

  createUser(payload: { name: string; email: string }): Observable<User> {
    return this.http.post<User>(environment.api.user, payload);
  }

  updateUser(userId: number, payload: { name: string; email: string }): Observable<User> {
    return this.http.put<User>(`${environment.api.user}/${userId}`, payload);
  }
}
