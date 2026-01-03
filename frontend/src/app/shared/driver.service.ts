import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  private _url: string = "";

  constructor(private http: HttpClient) { }

  getDriverData(data: string = '', pageNumber = 0, sortField = "createdAt", sortFieldValue = 1) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/driver/getDriverDetails?data=` + encodeURIComponent(data) + "&pagenumber=" + encodeURIComponent(pageNumber) + "&sortField=" + encodeURIComponent(sortField) + "&sortFieldValue=" + encodeURIComponent(sortFieldValue);
    return this.http.get(this._url);
  }

  getDriverDetailsForRide(rideServiceTypeId: string, rideCityId: string) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/driver/getDriverDetailsForRide?rideServiceTypeId=` + encodeURIComponent(rideServiceTypeId) + "&rideCityId=" + encodeURIComponent(rideCityId);
    return this.http.get(this._url);
  }

  addNewDriver(data: any) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/driver/addDriver`;
    return this.http.post(this._url, data);
  }

  editDriver(id: string, data: any) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/driver/editDriver/` + encodeURIComponent(id);
    return this.http.patch(this._url,data);
  }

  deleteDriver(id: string) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/driver/deleteDriver/` + encodeURIComponent(id);
    return this.http.delete(this._url);
  }

}
