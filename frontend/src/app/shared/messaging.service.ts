import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  currentMessage = new BehaviorSubject<any>(null);

  constructor(private _angularFireMessaging: AngularFireMessaging) { }

  requestPermission() {



    Notification.requestPermission()
    .then((permission) => {


      if (permission === 'granted') {
        console.log('Notification permission granted.');

        
        this._angularFireMessaging.requestToken.subscribe({
          next: (token) => {
            console.log(token);
          },
          error: (error) => {
            console.log("Unable to get permission to notify..",error);
          }
        })
      }
    })
  }

  receiveMessaging() {
    this._angularFireMessaging.messages.subscribe({
      next: (payload) => {
        console.log("New message received", payload);
        this.currentMessage.next(payload)
      },
      error: () => {},
      complete: () => {}
    })
  }
}
