import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from 'src/app/shared/country.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {

  public title: string = "Search";
  public sideButtonTitle: string = "Add"
  private countryDropDownData: any = [];
  public countryList: any = [];
  public reactiveForm: FormGroup;
  private selectedCountry: any;
  private currencyCode: any;
  public customErrMsg: string;
  public focus : any;

  constructor(
    private _countryService : CountryService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.getCountryDropDownData();
    this.getCountry();

    this.reactiveForm = new FormGroup({
      countrySelect: new FormControl("null", [Validators.required]),
      countryName: new FormControl(null, []),
      countryTimeZone: new FormControl(null, []),
      countryCode: new FormControl(null, []),
      countryCurrency: new FormControl(null, []),
      countryFlag: new FormControl(null, []),
      countrySearch: new FormControl(null, [])
    });
  }

  getCountryDropDownData() {
    this._countryService.getCountryList().subscribe({
      next: (response) => {
          this.countryDropDownData = response;
          this.countryDropDownData.sort((a, b) => (a.name.common > b.name.common) ? 1 : -1)
      },
      error: (error) => {
        console.log(error);        
      }
    })
  }

  handleCountryChange(countryName: string) {
    this.customErrMsg = "";
    this.selectedCountry = this.countryDropDownData.find(country => countryName === country.name.common);

    if (this.selectedCountry.currencies) {
      this.currencyCode = Object.keys(this.selectedCountry.currencies)[0];
      this.reactiveForm.get('countryCurrency').setValue(this.selectedCountry.currencies[this.currencyCode].symbol + " " + this.selectedCountry.currencies[this.currencyCode].name);
    } else {
      this.reactiveForm.get('countryCurrency').setValue('');
    }

    if (this.selectedCountry.idd.root) {
      this.reactiveForm.get('countryCode').setValue(this.selectedCountry.idd.root + this.selectedCountry.idd?.suffixes[0]);
    } else {
      this.reactiveForm.get('countryCode').setValue("");      
    }
    
    
    this.reactiveForm.get('countryName').setValue(this.selectedCountry.name.common);    
    this.reactiveForm.get('countryTimeZone').setValue(this.selectedCountry.timezones[0]);
    this.reactiveForm.get('countryFlag').setValue(this.selectedCountry.flag);
  }

  getCountry() {
    this._countryService.getCountry().subscribe({
      next: (response) => {
        this.countryList = response.country;
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while getting the data");
        this.customErrMsg = error.error.msg;
      },
      complete: () => {}
    })
  }

  addCountryData() {
    if (this.reactiveForm.invalid === true) {
      this.customErrMsg = "Please select a country to add."
      this._toastrService.warning("Please select a country to add.");
      return;
    }

    const formData = new FormData();

    if (this.selectedCountry.name.common && this.selectedCountry.idd.root && this.selectedCountry.timezones && this.selectedCountry.currencies && this.selectedCountry.currencies && this.selectedCountry.flags.png) {
      formData.append('countryName', this.selectedCountry.name.common);
      formData.append('countryCode', this.selectedCountry.idd.root + this.selectedCountry.idd?.suffixes[0])
      formData.append('countryTimeZone', this.selectedCountry.timezones[0]);
      formData.append('countryCurrency', this.selectedCountry.currencies[this.currencyCode].name);
      formData.append('countryCurrencySymbol', this.selectedCountry.currencies[this.currencyCode].symbol);
      formData.append('countryFlag', this.selectedCountry.flags.png);
      formData.append('countryIcon', this.selectedCountry.flag);
    } else {
      this._toastrService.error("Can not add country due to insufficient data");
      return this.customErrMsg = "Can not add country due to insufficient data";
    }

    this._countryService.addCountry(formData).subscribe({
      next: (response) => {
        this.getCountry();
        this.cancel();
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error occured while adding country");
        this.customErrMsg = error.error.msg;
      },
      complete: () => {}
    })
  }

  cancel() {
    this.reactiveForm.reset();
    this.reactiveForm.get('countrySelect').markAsPristine()
    this.customErrMsg = "";
  }

  deleteCountry(id: string){
    this._countryService.deleteCountry(id).subscribe({
      next: (response) => {
          this.getCountry();
          this.cancel();
      },
      error: (error) => {
        this.customErrMsg = error.error.msg;
      },
      complete: () => {}
    })
  }

  sideButton() {
    if (this.sideButtonTitle === "Add") {
      this.title = "Add";
      this.sideButtonTitle = "Search";
    } else {
      this.title = "Search";
      this.sideButtonTitle = "Add";
    }
    this.customErrMsg = "";
    this.getCountry();
    this.cancel();
  }

  searchCountry(data: string) {

    if (this.reactiveForm.get('countrySearch').value === null) {
      return this.customErrMsg = "Please enter value to search";
    }

    this._countryService.getCountry(data).subscribe({
      next: (response) => {
        this.countryList = response.country;
      },
      error: (error) => {
        this.customErrMsg = error.error.msg;
      },
      complete: () => {}
    })
  }
}
