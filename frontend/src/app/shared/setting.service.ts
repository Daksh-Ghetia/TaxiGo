import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getSettingData() : Observable <any> {
    this._url = "http://localhost:3000/setting/getSettingDetails";
    return this.http.get(this._url);
  }

  updateSetting(id: string,data: any) : Observable <any> {
    this._url = "http://localhost:3000/setting/editSetting/" + id;
    return this.http.patch(this._url, data);
  }
  
}
