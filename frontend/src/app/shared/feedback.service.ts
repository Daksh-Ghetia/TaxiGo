import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private _url: string = "";

  constructor(private http: HttpClient) { }

  getFeedback() : Observable <any> {
    this._url = `${environment.apiBaseUrl}/feedback/getFeedback`;
    return this.http.get(this._url);
  }

  addFeedback(data: any) : Observable <any> {
    this._url = `${environment.apiBaseUrl}/feedback/newFeedback`;
    return this.http.post(this._url, data);
  }
}
