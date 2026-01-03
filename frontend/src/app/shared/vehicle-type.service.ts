import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class VehicleTypeService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getVehicleType() : Observable <any> {
    this._url = `${environment.apiBaseUrl}/vehicle/getVehicleDetails`;
    return this.http.get<any>(this._url);
  }

  addVehicleType(data: any) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/vehicle/addVehicle`;
    return this.http.post<any>(this._url, data)
  }

  editVehicleType(id: string, data: any) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/vehicle/editVehicle/` + id;
    return this.http.patch<any>(this._url, data);
  }

  deleteVehicleType(id: string) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/vehicle/deleteVehicle/` + id;
    return this.http.delete<any>(this._url)
  }
}
