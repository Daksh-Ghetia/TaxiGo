import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VehicleTypeService } from 'src/app/shared/vehicle-type.service';

@Component({
  selector: 'app-vehicle-type',
  templateUrl: './vehicle-type.component.html',
  styleUrls: ['./vehicle-type.component.scss']
})
export class VehicleTypeComponent implements OnInit {

  constructor(private _vehicleTypeService: VehicleTypeService) { }

  title: string = "Add";
  reactiveForm: FormGroup;
  vehicles: any = [];
  customErrMsg: string;
  updateId: string;

  ngOnInit(): void {
    this.getVehicleType()

    this.reactiveForm = new FormGroup({
       vehicleName: new FormControl(null, [Validators.required]),
       vehicleIcon: new FormControl(null, [Validators.required] ),
    });
  }

  /**Get the details of all the vehicles */
  getVehicleType() {
    /**Call the service and subscribe to the data change */
    this._vehicleTypeService.getVehicleType().subscribe((response) => {      
      this.vehicles = response.vehicle;
    })
  }

  /**Delete the vehicle type*/
  deleteVehicleType(id: string) {
    /**Call the service for deleting the vehicle type */
    this._vehicleTypeService.deleteVehicleType(id).subscribe((response) => {
      this.getVehicleType();
    })
  }

  addVehicleType() {
    let buttonVal = document.getElementById('submit').textContent

    if (buttonVal === "Edit Vehicle Type") {
      return this.editVehicleType();
    }
    
    if (this.reactiveForm.invalid === true) {
      this.reactiveForm.get('vehicleName').markAsDirty();
      this.reactiveForm.get('vehicleIcon').markAsTouched();
      return console.log("Invalid form details");
    }
    
    const vehicleAddForm = document.getElementById('addNewVehicleType') as HTMLFormElement;
    const formData = new FormData(vehicleAddForm);
    
    this._vehicleTypeService.addVehicleType(formData).subscribe((response) => {
      this.getVehicleType();
      this.cancelAction();
    }, (error) => {
      this.customErrMsg = error.error.msg;
      console.log(error);
    });
  }

  editVehicleType() {
    if (this.updateId === "" || this.reactiveForm.get('vehicleName').value == "") {
      return console.log("invalidUpdata");
    }    

    const vehicleAddForm = document.getElementById('addNewVehicleType') as HTMLFormElement;
    const formData = new FormData(vehicleAddForm);
    this._vehicleTypeService.editVehicleType(this.updateId, formData).subscribe((response) => {
      console.log(response);
      this.getVehicleType();
      this.cancelAction();
    })
  }

  editDetails (id: string, name: string) {
    this.title = "Edit";
    this.reactiveForm.get('vehicleName').setValue(name);
    this.updateId = id;
  }

  cancelAction() {
    this.title = "Add";
    this.reactiveForm.reset();
    this.reactiveForm.get('vehicleName').markAsPristine();
    this.reactiveForm.get('vehicleIcon').markAsUntouched();
    this.updateId = "";
    this.customErrMsg = "";
  }

  testAuth(){
    this._vehicleTypeService.test().subscribe((msg) => {
      console.log(msg);
    })
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
}