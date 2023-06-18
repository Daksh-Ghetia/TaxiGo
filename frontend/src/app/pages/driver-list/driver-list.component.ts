import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CityService } from 'src/app/shared/city.service';
import { CountryService } from 'src/app/shared/country.service';
import { DriverService } from 'src/app/shared/driver.service';
import { VehiclePricingService } from 'src/app/shared/vehicle-pricing.service';

@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss']
})
export class DriverListComponent implements OnInit {

  public driverForm: FormGroup;
  public driverServiceTypeForm: FormGroup;
  public countryList: any = [];
  public cityList: any = [];
  public serviceList: any = [];
  public selectedCountryCode: string = '';
  public actionButton: string = 'Add';
  public customErrMsg: string = '';
  public driverDataList: any = [];
  public sideButtonTitle: string = "Add";
  private modalRef: NgbModalRef;
  public p: any;
  public totalRecordLength: number;
  

  /**For sorting data */
  private sortedColumn: string = '';
  public currentSort: string = "";
  public currentSortDirection: string = '';
  private isAscending: boolean = true;

  constructor(
    private _countryService: CountryService,
    private _cityService: CityService,
    private _vehiclePricingService: VehiclePricingService,
    private _driverService: DriverService,
    private _modalService: NgbModal,
    private _toastrService: ToastrService,
  ) { }

  ngAfterViewInit() {
    this.getDriverData();
  }

  ngOnInit(): void {
    this.fillCountryDropDown();

    this.driverForm = new FormGroup({
      driverName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z]+([ ][a-zA-Z]+)*$/)]),
      driverEmail: new FormControl(null, [Validators.required, Validators.email]),
      driverCountryId: new FormControl(null, [Validators.required]),
      driverCountryCode: new FormControl(null, []),
      driverCityId: new FormControl(null, [Validators.required]),
      driverPhone: new FormControl(null, [Validators.required, Validators.pattern(/^\d{10}$/)]),
      driverProfile: new FormControl(null, []),
      driverSearch: new FormControl(null, [])
    })

    this.driverServiceTypeForm = new FormGroup({
      driverServiceTypeId: new FormControl(null, [Validators.required])
    })
  }

  getDriverData(pageNumber: number = 0) {
    let data: string = "";
    if (this.sideButtonTitle == "Add") {
      data = (document.getElementById('searchDriver') as HTMLInputElement).value;
    }
    this._driverService.getDriverData(data, pageNumber).subscribe({
      next: (response) => {
        this.totalRecordLength = response.totalRecord;
        this.driverDataList = response.driver;
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {}
    })
  }

  fillCountryDropDown() {
    this._countryService.getCountry().subscribe({
      next: (response) => {
        this.countryList = response.country;
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }
  
  fillCityDropDown(countryName: string) {
    this._cityService.getCityList(countryName).subscribe({
      next: (response) => {
        this.cityList = response.city;
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }

  fillVehicleDropDown(cityId: string) {
    this._vehiclePricingService.getVehiclePricing(cityId).subscribe({
      next: (response) => {
        this.serviceList = response.vehiclePricing;
      },
      error: (error) => {
        this.serviceList = [];
        this._toastrService.warning("For this city there are no services available currently ", "No service found");
      }
    })
  }

  setSelectedCountry(countryName: string) {
    const selectedCountry = this.countryList.find(country => country._id === countryName);
    if (selectedCountry) {
      this.selectedCountryCode = selectedCountry.countryCode;
    }
  }

  addDriver() {
    if (this.driverForm.invalid == true) {
      this.driverForm.markAllAsTouched();
      return
    }

    const driverForm = (document.getElementById('driver') as HTMLFormElement)
    const driverFormData = new FormData(driverForm) ;

    if (this.actionButton == "Edit") {
      return this.editDriver(driverFormData);
    }    

    this._driverService.addNewDriver(driverFormData).subscribe({
      next: (response) => {
        this.getDriverData();
        this.cancelDriver();
      },
      error: (error) => {
        this.customErrMsg = error.error.message;
      },
      complete: () => {}
    })
  }

  editDriver(editFormData: any) {
    const id = (document.getElementById('editDriverId') as HTMLElement).textContent;
    this._driverService.editDriver(id, editFormData).subscribe({
      next: (response) => {
        this.getDriverData();
        this.cancelDriver();
      },
      error: (error) => {
        this.customErrMsg = error.error.message;
        console.log(error);
      },
      complete: () => {}
    })
  }

  updateDriverStatus(id: any, data: boolean){
    const updateDriverStatusData = new FormData();
    updateDriverStatusData.append('driverStatus', data.toString());
    this._driverService.editDriver(id, updateDriverStatusData).subscribe({
      next: (response) => {
        this.getDriverData();
        this.cancelDriver();
      },
      error: (error) => {
        this.customErrMsg = error.error.message;
        console.log(error);
      },
      complete: () => {}
    })

  }

  deleteDriver(id: string) {
    let choice  = confirm('are you sure you want to delete Driver')

    if (choice == false) {
      return;
    }
    
    this._driverService.deleteDriver(id).subscribe({
      next: (response) => {
        this.getDriverData();
        this.cancelDriver();
      },
      error: (error) => {
        this.customErrMsg = error.error.message;
        console.log(error);        
      },
      complete: () => {}
    })
  }

  fillDataForEdit(data: any) {
    this.fillCityDropDown(data.driverCountryId);
    this.selectedCountryCode = data.country.countryCode;

    this.driverForm.patchValue({
      'driverName' : data.driverName,
      'driverEmail': data.driverEmail,
      'driverCountryId': data.driverCountryId,
      'driverCountryCode': data.country.countryCode,
      'driverCityId': data.driverCityId,
      'driverPhone': data.driverPhone
    });
    (document.getElementById('editDriverId') as HTMLElement).textContent = data._id;
    
    this.sideButtonTitle = "Search";
    this.actionButton = "Edit";
  }

  cancelDriver() {
    this.driverForm.reset();
    this.customErrMsg = "";
    this.cityList = []
    this.actionButton = "Add";
    this.getDriverData();
  }

  searchDriver(data: string) {
    this._driverService.getDriverData(data).subscribe({
      next: (response) => {
        this.totalRecordLength = response.totalRecord;
        this.driverDataList = response.driver;
        if (response.driver.length === 0) {
          this._toastrService.info("there are no drivers to display", "No drivers")
        }
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
  }

  sideButton() {
    if (this.sideButtonTitle === "Add") {
      this.sideButtonTitle = "Search";
    } else {
      this.sideButtonTitle = "Add";
    }
    this.customErrMsg = "";
    this.getDriverData();
    this.cancelDriver();
  }

  sortData(columnName: string) {
    if (this.sortedColumn === columnName) {
      if (this.currentSortDirection == "asc") {
        this.isAscending = !this.isAscending; // Reverse the order if the same column is clicked again
        this.currentSortDirection = "desc";        
      } else {
        this.isAscending = !this.isAscending;
        this.currentSortDirection = "asc"
      }
    } else {
      this.isAscending = true; // Set the default order to ascending
      this.sortedColumn = columnName; // Update the sorted column
      this.currentSort = columnName;
      this.currentSortDirection = "asc";
    }

    // Sort the data based on the selected column and order
    this.driverDataList.sort((a, b) => {
      if (this.isAscending) {
        return (a[columnName] > b[columnName]) ? 1 : -1;
      } else {
        return (a[columnName] < b[columnName]) ? 1 : -1;
      }
    });
  }

  updateServiceModel(content: any, cityId: string, driverId: string, vehicleServiceTypeId: string = null){
    this.driverServiceTypeForm.reset();
		this.modalRef = this._modalService.open(content, { centered: true });
    this.fillVehicleDropDown(cityId);
    this.driverServiceTypeForm.patchValue({driverServiceTypeId: vehicleServiceTypeId});
    (document.getElementById('editDriverId') as HTMLElement).textContent = driverId;
	}

  updateService(operation: string= "") {

    /**Check if the value is valid if admin want to save if not return error*/
    if (this.driverServiceTypeForm.invalid && operation != 'Delete') {
      this.driverServiceTypeForm.markAllAsTouched();
      return this._toastrService.info("please select a service type to update service type", "Service Required");
    }

    /**Create a new form data and bind it with necessary information, along with this also get the driver id */
    let driverFormData: FormData;    
    let driverId = (document.getElementById('editDriverId') as HTMLElement).textContent;
    if (operation !== 'Delete') {      
      const driverForm = (document.getElementById('driverServiceType') as HTMLFormElement);
      driverFormData = new FormData(driverForm);
    } else {
      driverFormData = new FormData();
      driverFormData.append('driverServiceTypeId', null);
      this.driverServiceTypeForm.reset();
    }

    /**Update the service type */
    this._driverService.editDriver(driverId, driverFormData).subscribe({
      next: (response) => {
        this.modalRef.close();
        this.getDriverData();        
      },
      error: (error) => {
        console.log(error);        
      },
      complete: () => {}
    })
    
  }
}