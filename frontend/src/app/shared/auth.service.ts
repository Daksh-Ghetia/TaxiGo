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
  
  isLoggedIn() {
    return !!localStorage.getItem('token')
  }
}
