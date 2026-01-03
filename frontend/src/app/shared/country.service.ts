import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getCountryList() : Observable<any> {
    this._url = "https://restcountries.com/v3.1/all?fields=name,idd,currencies,timezones,flag,flags"
    return this.http.get<any>(this._url);
  }

  getSingleCountryData(countryName: string) : Observable <any> {
    this._url = "https://restcountries.com/v3.1/name/" + encodeURIComponent(countryName) + "?fullText=true";
    return this.http.get<any>(this._url);
  }

  getCountry(data: any = "") : Observable<any> {
    this._url = `${environment.apiBaseUrl}/country/GetCountryDetails?countryName=` + encodeURIComponent(data);
    return this.http.get<any>(this._url)
  }

  addCountry(data: any) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/country/AddNewCountry`;
    return this.http.post(this._url, data);
  }

  deleteCountry(id: string) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/country/DeleteCountry/` + encodeURIComponent(id);
    return this.http.delete(this._url);
  }
}
