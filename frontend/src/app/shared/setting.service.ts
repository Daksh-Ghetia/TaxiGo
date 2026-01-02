import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getSettingData() : Observable <any> {
    this._url = `${environment.apiBaseUrl}/setting/getSettingDetails`;
    return this.http.get(this._url);
  }

  updateSetting(id: string,data: any) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/setting/editSetting/` + id;
    return this.http.patch(this._url, data);
  }

}
