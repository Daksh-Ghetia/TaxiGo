import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class VehiclePricingService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getVehiclePricing(cityId: string = "", pageNumber = 0, sortField = "updatedAt", sortFieldValue = 1) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/vehiclePricing/getVehiclePricing?&cityId=` + cityId + "&pageNumber=" + encodeURIComponent(pageNumber) + "&sortField=" + encodeURIComponent(sortField) + "&sortFieldValue=" + encodeURIComponent(sortFieldValue);
    return this.http.get(this._url);
  }

  addVehiclePricing(data: any) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/vehiclePricing/addVehiclePricing`;
    return this.http.post(this._url, data);
  }

  editVehiclePricing(id: string, data: any) : Observable<any> {
    this._url = `${environment.apiBaseUrl}/vehiclePricing/updateVehiclePricing/` + encodeURIComponent(id);
    return  this.http.patch(this._url, data);
  }

  deleteVehiclePricing(id: string) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/vehiclePricing/deleteVehiclePricing/` + encodeURIComponent(id);
    return this.http.delete(this._url);
  }

  calculateVehiclePricing(id: string, distance: number, time: number) : Observable <any> {

    this._url = `${environment.apiBaseUrl}/vehiclePricing/calculatePricing/` + encodeURIComponent(id) + "?distance=" + encodeURIComponent(distance) + "&time=" + encodeURIComponent(time);
    return this.http.get(this._url);
  }
}
