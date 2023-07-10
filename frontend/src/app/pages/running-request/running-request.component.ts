import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FeedbackService } from 'src/app/shared/feedback.service';
import { RideService } from 'src/app/shared/ride.service';
import { WebSocketService } from 'src/app/shared/web-socket.service';

@Component({
  selector: 'app-running-request',
  templateUrl: './running-request.component.html',
  styleUrls: ['./running-request.component.scss']
})
export class RunningRequestComponent implements OnInit {

  public rideDataList: any = [];
  public fullRideData: any = [];
  public p: number = 1;
  public totalRecordLength: number;
  public feedbackForm: FormGroup;
  public modalRef: NgbModalRef;

  private feedbackRideId: any;


  constructor(
    private _rideService: RideService,
    private _toastrService: ToastrService,
    private _webSocketService: WebSocketService,
    private _feedbackService: FeedbackService,
    private _modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.getRideData();
    this.listenToSocket();

    this.feedbackForm = new FormGroup({
      userFeedback: new FormControl(null, [Validators.required]),
      feedbackRideId: new FormControl(null, [Validators.required])
    })
  }

  getRideData() {
    this._rideService.getRideData([3,4,5,6], null, this.p-1).subscribe({
      next: (response) => {
        if (response.ride.length == 0) {
          this.rideDataList = [];
          return this._toastrService.info("No rides to display");
        }
        this.rideDataList = response.ride;
        this.totalRecordLength = response.totalRecord ? response.totalRecord : response.ride.length;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting data");
      },
      complete: () => {}
    })
  }

  getFullRideInfo(content: any, index: number) {
    this.modalRef = this._modalService.open(content, { centered: true, scrollable: true });
    this.fullRideData = [this.rideDataList[index]];
  }

  acceptRequest(ride: any) {
    this._webSocketService.emit('driverAcceptReuest', {driver: {_id: ride.rideDriverId}, ride: {_id: ride._id}});
    this.getRideData();
  }

  rejectRequest(ride: any) {
    if (ride.rideDriverAssignType == 1) {
      if (confirm('Are you sure you want to reject the ride')) {
        this._webSocketService.emit('driverRejectRequestSelected', {driver: {_id: ride.rideDriverId}, ride: {_id: ride._id}});
        this.getRideData();
      }
    } else {
      if (confirm('Are you sure you want to reject the ride')) {
        this._webSocketService.emit('driverRejectRequestNearest', {driver: {_id: ride.rideDriverId}, ride: {_id: ride._id}});
        this.getRideData();
      }
    }
  }

  updateRide(id: string, rideStatusUpdate: number, content: any) {
    const rideData = new FormData();
    rideData.append('rideStatus', String(rideStatusUpdate));
    this._rideService.updateRide(id, rideData).subscribe({
      next: (response) => {
        console.log(response);
        this.getRideData();
        this._toastrService.success("Ride status updated");
        this.feedbackForm.patchValue({
          "feedbackRideId": response.ride._id
        })
        if (rideStatusUpdate == 7) {
          this.feedbackRideId = response.ride._id
          this.feedback(content);
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }

  listenToSocket() {
    this._webSocketService.listen('dataChange').subscribe({
      next: () => {
        this.getRideData();
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })

    this._webSocketService.listen('driverAcceptRequest').subscribe({
      next: () => {
        this._toastrService.success("Congratulations driver accepted the request")
      }
    })

    this._webSocketService.listen('errorOccured').subscribe({
      next: (response: any) => {
        this._toastrService.error(response || "Error occured in socket");
      }
    })
  }

  feedback(content: any) {
    this.modalRef = this._modalService.open(content, { centered: true, scrollable: true });
  }

  submitFeedBack() {
    if (this.feedbackForm.invalid) {
      return this._toastrService.info("Please enter valid details to give feedback");
    }

    const feedbackForm = (document.getElementById('feedbackForm') as HTMLFormElement)
    let feedbackData = new FormData(feedbackForm);
    feedbackData.append('feedbackRideId', this.feedbackRideId.toString());

    this._feedbackService.addFeedback(feedbackData).subscribe({
      next: (response) => {
        this._toastrService.success(response.msg || "Thankyou for your response");
        this.modalRef.close();
      },
      error: (error) => {
        console.log(error);
        this._toastrService.error(error.error.msg || "Error occured while submiting response");
      },
      complete: () => {}
    })
  }
}
