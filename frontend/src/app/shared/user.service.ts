import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _url: string = "";

  constructor(private http: HttpClient) { }

  getUserData(data: string = '') : Observable <any> {
    this._url = "http://localhost:3000/user/getUserDetails?data=" + encodeURIComponent(data);
    return this.http.get(this._url);
  }

  addNewUser(data: any) : Observable <any> {
    this._url = "http://localhost:3000/user/addUser";
    return this.http.post(this._url, data);
  }

  editUser(id: string, data: any) : Observable <any> {
    this._url = "http://localhost:3000/user/editUser/" + encodeURIComponent(id);
    return this.http.patch(this._url,data);
  }

  deleteUser(id: string) : Observable <any> {
    this._url = "http://localhost:3000/user/deleteUser/" + encodeURIComponent(id);
    return this.http.delete(this._url);
  }

  addPaymentDetails(id: string) : Observable<any> {
    this._url = "http://localhost:3000/user/addPaymentDetails/" + encodeURIComponent(id);
    return this.http.post(this._url, {});
  }

  getCardDetails(id: string) : Observable <any> {
    this._url = "http://localhost:3000/user/getCardsList/" + encodeURIComponent(id);
    return this.http.get(this._url);
  }

  setDefaultCard (customerId: string, defaultPaymentCardId: string) : Observable <any> {
    this._url = "http://localhost:3000/user/setDefaultCard";
    return this.http.patch(this._url, {customerId: customerId,defaultPaymentCardId: defaultPaymentCardId});
  }

  deleteCard (cardId: string) : Observable <any> {
    this._url = "http://localhost:3000/user/deleteCard/" + encodeURIComponent(cardId);
    return this.http.delete(this._url);
  }
}
