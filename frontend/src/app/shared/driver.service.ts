import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  private _url: string = "";

  constructor(private http: HttpClient) { }

  getDriverData(data: string = '') : Observable <any> {
    this._url = "http://localhost:3000/driver/getDriverDetails?data=" + encodeURIComponent(data);
    return this.http.get(this._url);
  }

  addNewDriver(data: any) : Observable<any> {
    this._url = "http://localhost:3000/driver/addDriver";
    return this.http.post(this._url, data);
  }

  editDriver(id: string, data: any) : Observable <any> {
    this._url = "http://localhost:3000/driver/editDriver/" + encodeURIComponent(id);
    return this.http.patch(this._url,data);
  }

  deleteDriver(id: string) : Observable<any> {
    this._url = "http://localhost:3000/driver/deleteDriver/" + encodeURIComponent(id);
    return this.http.delete(this._url);
  }

}
