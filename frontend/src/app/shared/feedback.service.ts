import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  private _url: string = "";

  constructor(private http: HttpClient) { }

  getFeedback() : Observable <any> {
    this._url = "http://localhost:3000/feedback/getFeedback";
    return this.http.get(this._url);
  }

  addFeedback(data: any) : Observable <any> {
    this._url = "http://localhost:3000/feedback/newFeedback";
    return this.http.post(this._url, data);
  }
}
