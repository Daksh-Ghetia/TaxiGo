import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RideService {

  private _url = "";

  constructor(private http: HttpClient) { }

  addNewRide(data: any) : Observable <any> {
    this._url = "http://localhost:3000/ride/addRide";
    return this.http.post(this._url, data);
  }
}
