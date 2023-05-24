import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './shared/web-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'argon-dashboard-angular';

  constructor( private _webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this._webSocketService.listen('test-event').subscribe((data) => {
      console.log(data);
    })
  }
}
