import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getCityList(countryId: string = "") : Observable<any> {    
    this._url = "http://localhost:3000/city/GetCityDetails?countryId=" + encodeURIComponent(countryId);
    return this.http.get(this._url);
  }

  addCity(data: any) : Observable<any> {
    this._url = "http://localhost:3000/city/AddNewCity";
    return this.http.post(this._url, data);
  }

  editCity(id: string,data: any): Observable<any> {
    this._url = "http://localhost:3000/city/editCity/" + encodeURIComponent(id);
    return this.http.patch(this._url,data);
  }

  deleteCity(id: string) : Observable<any> {
    this._url = "http://localhost:3000/city/deleteCity/" + encodeURIComponent(id);
    return this.http.delete(this._url)
  }

  checkPointIsInsZone(lat: any, lng: any) : Observable<any> {
    this._url = "http://localhost:3000/city/checkCity?lat=" + encodeURIComponent(lat) + "&lng=" + encodeURIComponent(lng);
    return this.http.get(this._url)
  }
}