import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _url = "";

  constructor(private http: HttpClient) { }

  authenticateAdmin(data: any) : Observable<any> {
    
    this._url = "http://localhost:3000/admin/login";
    return this.http.post<any>(this._url, data);
  }

  logOutAdmin() {
    this._url = "http://localhost:3000/admin/logout";
    return this.http.post<any>(this._url, {});
  }

  logOutAdminAllDevice() {
    this._url = "http://localhost:3000/admin/logoutALL";
    return this.http.post<any>(this._url, {});
  }
  
  isLoggedIn() {
    return !!localStorage.getItem('token')
  }
}
