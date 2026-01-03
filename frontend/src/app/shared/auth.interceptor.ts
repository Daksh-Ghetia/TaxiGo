import { Injectable } from '@angular/core';
import { HttpRequest,HttpHandler,HttpEvent,HttpInterceptor,HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private _toasterService: ToastrService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.includes('fcm.googleapis.com/fcm/send')) {
      return next.handle(request);
    }

    const localToken = localStorage.getItem('token');
    request = request.clone({headers: request.headers.set('Authorization', 'Bearer ' + localToken)})
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.error.error === "Please Authenticate") {
          localStorage.clear();
          this.router.navigate(['login']).then(() => {});
          this._toasterService.error("Please login with the correct credentials to access the details", "Authentication Failed");
        } else {
          return throwError(() => error);
        }
      })
    );
  }
}
