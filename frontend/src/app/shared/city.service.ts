import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CityService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getCityList(countryId: string = "") : Observable<any> {
    this._url = `${environment.apiBaseUrl}/city/GetCityDetails?countryId=` + encodeURIComponent(countryId);
    return this.http.get(this._url);
  }

  addCity(data: any) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/city/AddNewCity`;
    return this.http.post(this._url, data);
  }

  editCity(id: string,data: any): Observable<any> {
    this._url = `${environment.apiBaseUrl}/city/editCity/` + encodeURIComponent(id);
    return this.http.patch(this._url,data);
  }

  deleteCity(id: string) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/city/deleteCity/` + encodeURIComponent(id);
    return this.http.delete(this._url)
  }

  checkPointIsInsZone(lat: any, lng: any) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/city/checkCity?lat=` + encodeURIComponent(lat) + "&lng=" + encodeURIComponent(lng);
    return this.http.get(this._url)
  }
}
