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
  public p: any = 1;
  public totalRecordLength: number;
  

  /**For sorting data */
  private sortedColumn: string = 'createdAt';
  public currentSort: string = "";
  public currentSortDirection: string = 'asc';
  private isAscending: boolean = true;

  constructor(
    private _countryService: CountryService,
    private _cityService: CityService,
    private _vehiclePricingService: VehiclePricingService,
    private _driverService: DriverService,
    private _modalService: NgbModal,
    private _toastrService: ToastrService,
  ) { }

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

  ngAfterViewInit() {
    this.getDriverData();
  }

  getDriverData() {
    let data: string = "";
    if (this.sideButtonTitle == "Add") {
      data = (document.getElementById('searchDriver') as HTMLInputElement).value;
    }
    
    this._driverService.getDriverData(data, this.p-1, this.sortedColumn, this.currentSortDirection == "asc" ? 1 : -1).subscribe({
      next: (response) => {
        this.totalRecordLength = response.totalRecord;
        this.driverDataList = response.driver;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting data", "");
        console.log(error);
      },
      complete: () => {}
    })
  }

  fillCountryDropDown() {
    this._countryService.getCountry().subscribe({
      next: (response) => {
        if (response.country.length == 0) {
          return this._toastrService.info("Please add new countries", "No countries found");
        }
        this.countryList = response.country;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg, "Error occured while getting country data");
        console.log(error);        
      },
      complete: () => {}
    })
  }
  
  fillCityDropDown(countryName: string) {
    this._cityService.getCityList(countryName).subscribe({
      next: (response) => {
        if (response.city.length == 0) {
          return this._toastrService.info("Please add cities for the country selected", "No cities");
        }
        this.cityList = response.city;
      },
      error: (error) => {
        console.log(error);        
        return this._toastrService.error(error.error.msg, "Error occured while getting city data");
      },
      complete: () => {}
    })
  }

  fillVehicleDropDown(cityId: string) {
    this._vehiclePricingService.getVehiclePricing(cityId).subscribe({
      next: (response) => {
        if (response.vehiclePricing.length == 0) {
          return this._toastrService.error("No vehicle type found.");
        }
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
      this._toastrService.warning("please enter valid information for adding new driver", "Invalid information");
      return
    }

    const driverForm = (document.getElementById('driver') as HTMLFormElement)
    const driverFormData = new FormData(driverForm);

    if (this.actionButton == "Edit") {
      return this.editDriver(driverFormData);
    }    

    this._driverService.addNewDriver(driverFormData).subscribe({
      next: (response) => {
        this.cancelDriver();
        this.sortedColumn = "createdAt";
        this.sortData("createdAt");
        this.getDriverData();
        this._toastrService.success("Driver added successfully");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg, "Error occured while adding driver");
        this.customErrMsg = error.error.msg;
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
        this._toastrService.success("Driver updated successfully", "");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg, "Error occured while updating driver");
        this.customErrMsg = error.error.msg;
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
        this._toastrService.success("Driver status updated successfully", "");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg, "Error occured while updating driver status");
        this.customErrMsg = error.error.msg;
      },
      complete: () => {}
    })

  }

  deleteDriver(id: string) {
    if (confirm('are you sure you want to delete Driver')) {
      this._driverService.deleteDriver(id).subscribe({
        next: (response) => {
          this.driverDataList.length == 1 ? this.p != 1 ? this.p -= 1 : this.p = 1 : {};
          this.getDriverData();
          this.cancelDriver();
          this._toastrService.success("Driver deleted successfully", "");
        },
        error: (error) => {
          this._toastrService.error(error.error.msg, "Error occured while deleting user");
          this.customErrMsg = error.error.msg;
        },
        complete: () => {}
      })
    }
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
    this.sortedColumn = "";
    this.sortData("createdAt");
    this.getDriverData();
  }

  searchDriver(data: string) {
    this._driverService.getDriverData(data).subscribe({
      next: (response) => {
        if (response.driver.length === 0) {
          return this._toastrService.info("there are no drivers to display", "No drivers")
        }
        this.sortedColumn = "";
        this.sortData("createdAt")
        this.totalRecordLength = response.totalRecord;
        this.driverDataList = response.driver;
        this.p = 1
        this._toastrService.success("Data found successfully", "");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting data", "");
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
    setTimeout(() => {
      this.getDriverData();
      this.cancelDriver();
    }, 10);
  }

  sortData(columnName: string) {
    if (this.sortedColumn === columnName) {
      this.isAscending = !this.isAscending; // Reverse the order if the same column is clicked again
      this.isAscending == true ? this.currentSortDirection = "asc" : this.currentSortDirection = "desc";
    } else {
      this.isAscending = true; // Set the default order to ascending
      this.sortedColumn = columnName; // Update the sorted column
      this.currentSort = columnName;
      this.currentSortDirection = "asc";
    }
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
        this._toastrService.success("Driver service type updated successfully");
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while updating service type", "");
      },
      complete: () => {}
    })
    
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}