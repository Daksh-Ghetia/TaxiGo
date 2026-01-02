import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _url: string = "";

  constructor(private http: HttpClient) { }

  getUserData(data: string = '', pageNumber = 0, sortField = "createdAt", sortFieldValue = 1) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/user/getUserDetails?data=` + encodeURIComponent(data) + "&pageNumber=" + encodeURIComponent(pageNumber) + "&sortField=" + encodeURIComponent(sortField) + "&sortFieldValue=" + encodeURIComponent(sortFieldValue);
    return this.http.get(this._url);
  }

  addNewUser(data: any) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/user/addUser`;
    return this.http.post(this._url, data);
  }

  editUser(id: string, data: any) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/user/editUser/` + encodeURIComponent(id);
    return this.http.patch(this._url,data);
  }

  deleteUser(id: string) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/user/deleteUser/` + encodeURIComponent(id);
    return this.http.delete(this._url);
  }

  addPaymentDetails(id: string) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/user/addPaymentDetails/` + encodeURIComponent(id);
    return this.http.post(this._url, {});
  }

  getCardDetails(id: string) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/user/getCardsList/` + encodeURIComponent(id);
    return this.http.get(this._url);
  }

  setDefaultCard (customerId: string, defaultPaymentCardId: string) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/user/setDefaultCard`;
    return this.http.patch(this._url, {customerId: customerId,defaultPaymentCardId: defaultPaymentCardId});
  }

  deleteCard (cardId: string) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/user/deleteCard/` + encodeURIComponent(cardId);
    return this.http.delete(this._url);
  }
}
