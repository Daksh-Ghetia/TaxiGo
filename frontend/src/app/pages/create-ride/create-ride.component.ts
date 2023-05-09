import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CityService } from 'src/app/shared/city.service';
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
  private userId: string;
  private serviceTypeId: string;

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
    private _vehiclePricing: VehiclePricingService,
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
      rideServiceType: new FormControl(null, [Validators.required]),
      rideDateTime: new FormControl(null, [Validators.required])
    })

    /**Get data of user whenever the phone number field is of length 10 and valid*/
    this.createRideForm.get('rideCustomerPhone').valueChanges.subscribe(value => {
      if (value && value.length == 10 && this.createRideForm.get('rideCustomerPhone').valid) {
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
          this.userId = response.user[0]._id;
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
    });

    /**Drop location */
    this.autocompleteDrop = new google.maps.places.Autocomplete(document.getElementById('rideDropLocation') as HTMLInputElement, {
      types: ['establishment']
    })
    this.autocompleteDrop.addListener("place_changed", () => {
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
  }

  /**Auto complete functionality for stops */
  bindAutoComplete(index: any) {
    setTimeout(() => {
      let autoCompleteIndex = new google.maps.places.Autocomplete(document.getElementById(index) as HTMLInputElement, {
        types: ['establishment']
      })
      autoCompleteIndex.addListener("place_changed", () => {
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
        this.fillServiceType(response.city._id);
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
    this._vehiclePricing.getVehiclePricing(cityId).subscribe({
      next: (response) => {
        this.serviceTypeList = response.vehiclePricing
        console.log(response);        
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
      this.createRideForm.markAllAsTouched();
      this.createRideForm.get('rideServiceType').reset();
      this._toastrService.warning("Please fill all the required field to perform search", "");
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
      let totalDistance = 0;
      let totalTime = 0;
      const routes = response.rows[0].elements;

      for (let i = 0; i < routes.length; i++) {
        const element = routes[i];
        if (element.status === "OK") {
          totalDistance += element.distance.value;
          totalTime += element.duration.value;
        }
      };      

      (document.getElementById("distance") as HTMLInputElement).innerText = (totalDistance/1000).toFixed(1) + " km";
      (document.getElementById("duration") as HTMLInputElement).innerText = Math.floor(totalTime/60) + " mins";
    })
    .catch((error) => {
      console.log(error);
    })
  }

  calculatePricing(){

    this._vehiclePricing.getVehiclePricing()
  }

  addNewRide() {
    // if (this.createRideForm.invalid) {
    //   return
    // }
    const createRideData = new FormData();

    console.log((document.getElementById('rideServiceType') as HTMLInputElement).value);
    
  }
}
