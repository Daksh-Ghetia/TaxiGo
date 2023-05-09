import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiclePricingService {

  private _url: string;

  constructor(private http: HttpClient) { }

  getVehiclePricing(cityId: string = "") : Observable<any> {
    this._url = "http://localhost:3000/vehiclePricing/getVehiclePricing?&cityId=" + cityId;
    return this.http.get(this._url);
  }

  addVehiclePricing(data: any) : Observable<any> {
    this._url = "http://localhost:3000/vehiclePricing/addVehiclePricing";
    return this.http.post(this._url, data);
  }

  editVehiclePricing(id: string, data: any) : Observable<any> {
    this._url = "http://localhost:3000/vehiclePricing/updateVehiclePricing/" + encodeURIComponent(id);
    return  this.http.patch(this._url, data);
  }

  deleteVehiclePricing(id: string) : Observable <any> {
    this._url = "http://localhost:3000/vehiclePricing/deleteVehiclePricing/" + encodeURIComponent(id);
    return this.http.delete(this._url);
  }
}
