import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './shared/web-socket.service';
import { MessagingService } from './shared/messaging.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'argon-dashboard-angular';

  constructor( private _webSocketService: WebSocketService,private messaging: AngularFireMessaging) {


    // this.messaging.requestPermission.subscribe({
    //   next:(data:any)=>{
    //     console.log('permission granted!');
    //   },error:(error)=>{
    //     console.log('permission denied', error);
    //   }
    // })
  }

  ngOnInit(): void {
    this._webSocketService.listen('test-event').subscribe((data) => {
      console.log(data);
    })
  }
}
