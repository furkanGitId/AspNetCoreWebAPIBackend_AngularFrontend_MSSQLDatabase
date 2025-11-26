import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError, EMPTY } from 'rxjs';
import { ToastService } from '../services/toast.service';


export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const router = inject(Router) as Router;
    const token = authService.getToken();
    const toast = inject(ToastService);

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            // Handle token expiration (401)
            if (err.status === 401) {
                toast.show('Session expired. Please log in again.', 'error');
                authService.logout();
                router.navigate(['/login']).catch(() => { });
                // IMPORTANT: stop error propagation
                return EMPTY;
            }

            // Other errors
            const msg = err.error?.message || 'Something went wrong. Try again.';
            toast.show(msg, 'error');
            return throwError(() => err);
        })
    );


};
