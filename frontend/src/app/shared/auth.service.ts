import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _url = "";

  constructor(private http: HttpClient) { }

  authenticateAdmin(data: any) : Observable<any> {

    this._url = `${environment.apiBaseUrl}/admin/login`;
    return this.http.post<any>(this._url, data);
  }

  logOutAdmin() {
    this._url = "${environment.apiBaseurl}/admin/logout";
    return this.http.post<any>(this._url, {});
  }

  logOutAdminAllDevice() {
    this._url = "${environment.apiBaseurl}/admin/logoutALL";
    return this.http.post<any>(this._url, {});
  }

  isLoggedIn() {
    return !!localStorage.getItem('token')
  }
}
