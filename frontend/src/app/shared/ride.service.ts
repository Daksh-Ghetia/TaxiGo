import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RideService {

  private _url = "";

  constructor(private http: HttpClient) { }

  getRideData(rideStatus = null, rideFilter = null, pageNumber = null) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/ride/getRideDetails`;
    return this.http.post(this._url, {
      rideStatus: rideStatus,
      rideFilter: rideFilter,
      pageNumber: pageNumber
    });
  }

  addNewRide(data: any) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/ride/addRide`;
    return this.http.post(this._url, data);
  }

  updateRide(id: string, data: any) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/ride/editRide/` + encodeURIComponent(id);
    return this.http.patch(this._url, data);
  }
}
