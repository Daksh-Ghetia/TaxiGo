import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CityService } from 'src/app/shared/city.service';
import { ConvertMinutesToHoursAndMinutesPipe } from 'src/app/shared/convert-minutes-to-hours-and-minutes.pipe';
import { RideService } from 'src/app/shared/ride.service';
import { SettingService } from 'src/app/shared/setting.service';
import { UserService } from 'src/app/shared/user.service';
import { VehiclePricingService } from 'src/app/shared/vehicle-pricing.service';

@Component({
  selector: 'app-create-ride',
  templateUrl: './create-ride.component.html',
  styleUrls: ['./create-ride.component.scss']
})
export class CreateRideComponent implements OnInit {

  public createRideForm: FormGroup;
  public customErrMsg: string;
  public allowedStopsCount: Number;
  public serviceTypeList: any = [];
  public cardDetails: any = [];
  public customerDetails: any

  private user: any;
  private totalDistance: number = 0;
  private totalTime: number = 0;
  private totalFare: number = 0;
  private cityDetails: any;

  /**Map variables */
  private map: google.maps.Map;
  private autocompletePickUp: google.maps.places.Autocomplete;
  private autocompleteDrop: google.maps.places.Autocomplete;
  private wayPts: google.maps.DirectionsWaypoint[] = [];
  private directionsService = new google.maps.DirectionsService();
  private directionsRenderer = new google.maps.DirectionsRenderer();
  private distanceMatService = new google.maps.DistanceMatrixService();

  constructor(
    private _userService: UserService,
    private _settingSerive: SettingService,
    private _cityService: CityService,
    private _vehiclePricingService: VehiclePricingService,
    private _rideService: RideService,
    private _toastrService: ToastrService,
    private _cdr: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    this.getSettingData();
    this.initAutoComplete();
    this.initMap();

    this.createRideForm = new FormGroup({
      rideCustomerPhone: new FormControl(null, [Validators.required, Validators.pattern(/^\d{10}$/)]),
      rideCustomerName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z]+([ ][a-zA-Z]+)*$/)]),
      rideCustomerEmail: new FormControl(null, [Validators.required, Validators.email]),
      ridePickUpLocation: new FormControl(null, [Validators.required,]),
      rideDropLocation: new FormControl(null, [Validators.required]),
      rideIntermediateStops: new FormArray([]),
      rideServiceTypeId: new FormControl(null, [Validators.required]),
      rideDateTime: new FormControl(null, [Validators.required]),
      ridePaymentMethod: new FormControl(null, [Validators.required]),
      ridePaymentCardId: new FormControl(null, [])
    })

    /**Get data of user whenever the phone number field is of length 10 and valid*/
    this.createRideForm.get('rideCustomerPhone').valueChanges.subscribe(value => {
      if (value && this.createRideForm.get('rideCustomerPhone').valid) {
        this.getUserData(value);        
      } else {
        this.createRideForm.get('rideCustomerName').reset();
        this.createRideForm.get('rideCustomerEmail').reset();
      }
    });

    this.createRideForm.get('ridePickUpLocation').valueChanges.subscribe(() => {
      if (this.createRideForm.get('ridePickUpLocation').value === "") {
        this.serviceTypeList = [];
      }
    })
  }

  /**Get settings data for displaying number of stops in between */
  getSettingData() {
    this._settingSerive.getSettingData().subscribe({
      next: (response) => {
        this.allowedStopsCount = response.setting[0].stopsInBetweenDestination
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }

  /**Get user data whenever number is added */
  getUserData(number: string) {
    this._userService.getUserData(number).subscribe({
      next: (response) =>  {
        if (response.user.length >0) {
          this.customErrMsg = "";
          this.user = response.user[0];
          this.paymentMethodChange();
          this.createRideForm.patchValue({
            rideCustomerName: response.user[0].userName,
            rideCustomerEmail: response.user[0].userEmail,
          })
        } else {
          this.createRideForm.get('rideCustomerName').reset();
          this.createRideForm.get('rideCustomerEmail').reset();
          this._toastrService.error('User is not allowed to book a ride', "");
        }
      },
    })
  }

  /**Auto complete functionality for pick up and drop location */
  initAutoComplete(){
    /**Pick up location */
    this.autocompletePickUp = new google.maps.places.Autocomplete(document.getElementById('ridePickUpLocation') as HTMLInputElement, {
      types: ['establishment']
    })
    this.autocompletePickUp.addListener("place_changed", () => {
      this.checkPointIsInsZone();
      this.showDirection();
      setTimeout(() => {
        this.calculateFare((document.getElementById('rideServiceTypeId')as HTMLSelectElement).value);      
      }, 100);
    });

    /**Drop location */
    this.autocompleteDrop = new google.maps.places.Autocomplete(document.getElementById('rideDropLocation') as HTMLInputElement, {
      types: ['establishment']
    })
    this.autocompleteDrop.addListener("place_changed", () => {
      this.showDirection();
      setTimeout(() => {
        this.calculateFare((document.getElementById('rideServiceTypeId')as HTMLSelectElement).value);      
      }, 100);
    });
  }

  /**Add new stop and bind it with autocomplete */
  addIntermediateStop() {
    /**Get the form array and push a new form control to the array */
    (<FormArray>this.createRideForm.get('rideIntermediateStops')).push(new FormControl('', [Validators.required]));
    this.bindAutoComplete((<FormArray>this.createRideForm.get('rideIntermediateStops')).length-1);
  }

  /**Delete the stop whenever called */
  deleteElement(index: number) {
    (<FormArray>this.createRideForm.get('rideIntermediateStops')).removeAt(index);
    this.showDirection();
    setTimeout(() => {
      this.calculateFare((document.getElementById('rideServiceTypeId')as HTMLSelectElement).value);      
    }, 1000);
  }

  /**Auto complete functionality for stops */
  bindAutoComplete(index: any) {
    setTimeout(() => {
      let autoCompleteIndex = new google.maps.places.Autocomplete(document.getElementById(index) as HTMLInputElement, {
        types: ['establishment']
      })
      autoCompleteIndex.addListener("place_changed", () => {
        this.showDirection();
        setTimeout(() => {
          this.calculateFare((document.getElementById('rideServiceTypeId')as HTMLSelectElement).value);
        }, 1000);
      });
    }, 100);
        
  }

  /**Reset the form and map */
  cancel() {
    this.createRideForm.reset();
    this.serviceTypeList = [];
    (this.createRideForm.get('rideIntermediateStops') as FormArray).clear();
  }

  /**Load the map */
  initMap(latitude:number = 22.270956722802083, longitude: number = 70.7387507402433, zoomSize:number = 12) {
    let location:any = {lat: Number(latitude), lng: Number(longitude)};
      
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: location,
      zoom: zoomSize
    });
    this.directionsRenderer.setMap(this.map);
  }

  checkPointIsInsZone() {
    this._cityService.checkPointIsInsZone(this.autocompletePickUp.getPlace().geometry.location.lat(), this.autocompletePickUp.getPlace().geometry.location.lng()).subscribe({
      next: (response) => {
        this.cityDetails = response.city._id;
        this.fillServiceType(this.cityDetails);
      },
      error: (error) => {
        this.createRideForm.get('ridePickUpLocation').reset();
        this.serviceTypeList = [];
        return this._toastrService.info("We are currently not providing service at you pick up point", "Service Unavailabel");
      },
      complete: () => {}
    })
  }

  fillServiceType(cityId: string) {
    this._vehiclePricingService.getVehiclePricing(cityId).subscribe({
      next: (response) => {
        this.serviceTypeList = response.vehiclePricing
        this._cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }

  showDirection() {
    if (this.createRideForm.get('ridePickUpLocation').invalid || this.createRideForm.get('rideDropLocation').invalid || this.createRideForm.get('rideIntermediateStops').invalid) {
      this.createRideForm.get('rideServiceTypeId').reset();
      return;
    }

    this.wayPts = [];
    /**Push all the intermediate stops into the array */
    for (let i = 0; i < (this.createRideForm.get('rideIntermediateStops') as FormArray).length; i++) {
      this.wayPts.push({
        location: (document.getElementById(String(i)) as HTMLInputElement).value,
        stopover: true
      })
    }

    this.directionsService.route({
      origin: (document.getElementById("ridePickUpLocation") as HTMLInputElement).value,
      destination: (document.getElementById("rideDropLocation") as HTMLInputElement).value,
      waypoints: this.wayPts,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      this.directionsRenderer.setDirections(response)
      this.setDistanceAndTime();
      this.calculateFare((document.getElementById('rideServiceTypeId')as HTMLSelectElement).value);
    })
    .catch((error) => {
      this.directionsRenderer.setDirections({routes: []});
      this.createRideForm.get('rideDropLocation').reset();
      for (let i = 0; i < (this.createRideForm.get('rideIntermediateStops') as FormArray).length; i++) {
        (this.createRideForm.get('rideIntermediateStops') as FormArray).controls[i].patchValue("");
      }
      return this._toastrService.info("currently we are provinding road travel only", "Services unavailable");
    });
  }

  setDistanceAndTime() {
    let destinattionArray = [];

    destinattionArray.push((document.getElementById("rideDropLocation") as HTMLInputElement).value);
    for (let i = 0; i < (this.createRideForm.get('rideIntermediateStops') as FormArray).length; i++) {
      destinattionArray.push((document.getElementById(String(i)) as HTMLInputElement).value);
    }

    this.distanceMatService.getDistanceMatrix({
      origins: [(document.getElementById("ridePickUpLocation") as HTMLInputElement).value],
      destinations: destinattionArray,
      travelMode: google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
    })
    .then((response) => {
      this.totalDistance = 0;
      this.totalTime = 0;
      const routes = response.rows[0].elements;

      for (let i = 0; i < routes.length; i++) {
        const element = routes[i];
        if (element.status === "OK") {
          this.totalDistance += element.distance.value;
          this.totalTime += element.duration.value;
        }
      };      

      this.totalDistance = Number((this.totalDistance/1000).toFixed(1));
      this.totalTime = Math.floor(this.totalTime/60);

      (document.getElementById("distance") as HTMLInputElement).innerText = this.totalDistance + " km";
      (document.getElementById("duration") as HTMLInputElement).innerText = new ConvertMinutesToHoursAndMinutesPipe().transform(this.totalTime);
    })
    .catch((error) => {
      console.log(error);
    })
  }

  calculateFare(vehicleTypeId: string){
    if (this.createRideForm.get('ridePickUpLocation').invalid || this.createRideForm.get('rideDropLocation').invalid || this.createRideForm.get('rideIntermediateStops').invalid || this.createRideForm.get('rideServiceTypeId').invalid) {
      return;
    }

    let servicePricing = this.serviceTypeList.find(service => service.vehicleType._id === vehicleTypeId)
    this._vehiclePricingService.calculateVehiclePricing(servicePricing._id, this.totalDistance, this.totalTime).subscribe({
      next: (response) => {
        this.totalFare = response.totalFare;
        (document.getElementById("fare") as HTMLInputElement).innerText = this.totalFare.toString();
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  addNewRide() {
    if (this.createRideForm.invalid) {
      this._toastrService.error("please fill all the necessary details", "Information missing");
      this.createRideForm.markAllAsTouched();
      return
    }

    let rideIntermediateStops = [];
    for (let i = 0; i < (this.createRideForm.get('rideIntermediateStops') as FormArray).length; i++) {
      rideIntermediateStops.push((document.getElementById(String(i) )as HTMLInputElement).value)
    }
    
    const createRideData = {
      'rideCustomerId': this.user._id,
      'rideServiceTypeId': (document.getElementById('rideServiceTypeId') as HTMLInputElement).value,
      'ridePickUpLocation': (document.getElementById('ridePickUpLocation') as HTMLInputElement).value,
      'rideDropLocation': (document.getElementById('rideDropLocation') as HTMLInputElement).value,
      'rideIntermediateStops': rideIntermediateStops,
      'rideCityId': this.cityDetails,
      'rideDistance': this.totalDistance,
      'rideTime': this.totalTime,
      'rideFare': this.totalFare,
    };

    if (this.createRideForm.get('ridePaymentMethod').value == 'card') {
      if (this.createRideForm.get('ridePaymentCardId').value != null) {
        createRideData['ridePaymentCardId'] = this.createRideForm.get('ridePaymentCardId').value;
      } else {
        return this._toastrService.info("Please select any one card available or else select cash","Payment information missing")
      }

    } else {
      return this._toastrService.info("Please select any one card available or else select cash","Payment information missing")
    }
    
    /**Add date and time for booking ride */
    (this.createRideForm.get('rideDateTime').value == 'bookNow') ? (createRideData["rideDateTime"] = new Date().toISOString()) : (createRideData["rideDateTime"] = (document.getElementById('scheduleDateTime') as HTMLInputElement).value);
    /**Add payment method */
    (this.createRideForm.get('ridePaymentMethod').value == 'cash') ? (createRideData["ridePaymentMethod"] = 0) : (createRideData["ridePaymentMethod"] = 1);

    /**Send data to create a new ride*/
    this._rideService.addNewRide(createRideData).subscribe({
      next: (response) => {
        this._toastrService.success("Your ride has been booked successfully", "Success");
        this.cancel();
      },
      error: (error) => {
        console.log(error);
        this._toastrService.error("Error occured while booking", "Error occured")
      },
      complete: () => {}
    })
  }

  paymentMethodChange() {
    if (this.createRideForm.get('ridePaymentMethod').value == "card") {
      /**Check if the user is having any payment method */
      if (this.user.userPaymentCustomerId != null) {
        this.createRideForm.get('ridePaymentCardId').setValue(null);
        this._userService.getCardDetails(this.user.userPaymentCustomerId).subscribe({
          next: (response) => {
            if (response.cardsData.length != 0) {
              this.customerDetails = response.customerData;
              this.cardDetails = response.cardsData;

              if (this.customerDetails.invoice_settings.default_payment_method != null) {
                this.createRideForm.get('ridePaymentCardId').setValue(this.customerDetails.invoice_settings.default_payment_method);
              }
            } else {
              this.cardDetails = [];
              this.customerDetails = undefined;
              this._toastrService.info("You do not have any registered card", "No card");
            }
          },
          error: (error) => {
            this._toastrService.error("error occured while getting card information","Error");
          },
          complete: () => {}
        })
      }
      else
      {
        this.cardDetails = [];
        this.customerDetails = undefined;
        this._toastrService.info("There are no cards to display currently");
      }
    } else{
      this.createRideForm.get('ridePaymentCardId').setValue(null);
    }
  }
}
