import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getCountryList() : Observable<any> {
    this._url = "https://restcountries.com/v3.1/all"
    return this.http.get<any>(this._url);
  }

  getCountry(data: any = "") : Observable<any> {
    this._url = "http://localhost:3000/country/GetCountryDetails?countryName=" + encodeURIComponent(data);
    return this.http.get<any>(this._url)
  }

  addCountry(data: any) : Observable<any> {
    this._url = "http://localhost:3000/country/AddNewCountry";
    return this.http.post(this._url, data);
  }

  deleteCountry(id: string) : Observable<any> {
    this._url = "http://localhost:3000/country/DeleteCountry/" + encodeURIComponent(id);
    return this.http.delete(this._url);
  }
}
