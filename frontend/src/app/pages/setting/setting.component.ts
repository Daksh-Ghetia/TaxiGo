import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingService } from 'src/app/shared/setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {

  public settingForm: FormGroup;
  public timeCountList: any = [10,20,30,45,60,90,120];
  public stopCountList: any = [1,2,3,4,5];
  private id: string;

  constructor(
    private _settingService: SettingService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit(): void {

    this.getSettingData();

    this.settingForm = new FormGroup({
      timeToAcceptRequest: new FormControl(null, [Validators.required]),
      stopsInBetweenDestination: new FormControl(null, [Validators.required]),
      stripePublicKey: new FormControl(null, [Validators.required]),
      stripeSecretKey: new FormControl(null, [Validators.required]),
      messagingSID: new FormControl(null, [Validators.required]),
      messagingAuthToken: new FormControl(null, [Validators.required]),
      mailClientID: new FormControl(null, [Validators.required]),
      mailClientSecret: new FormControl(null, [Validators.required])
    })
  }

  getSettingData() {
    this._settingService.getSettingData().subscribe({
      next: (response) => {
        this.id = response.setting[0]._id;
        this.settingForm.patchValue({
          timeToAcceptRequest: response.setting[0].timeToAcceptRequest,
          stopsInBetweenDestination: response.setting[0].stopsInBetweenDestination,
          stripePublicKey: response.setting[0].stripePublicKey,
          stripeSecretKey: response.setting[0].stripeSecretKey,
          messagingSID: response.setting[0].messagingSID,
          messagingAuthToken: response.setting[0].messagingAuthToken,
          mailClientID: response.setting[0].mailClientID,
          mailClientSecret: response.setting[0].mailClientSecret
        });
      },
      error: (error) => {
        this._toastrService.error(error.error.msg || "Error while getting the data");
      },
      complete: () => {}
    })
  }

  updateSetting() {
    const updateSettingForm = document.getElementById('setting') as HTMLFormElement
    const updateSettingData = new FormData(updateSettingForm);
    
    this._settingService.updateSetting(this.id, updateSettingData).subscribe({
      next: (response) => { 
        this.settingForm.patchValue({
          timeToAcceptRequest: response.setting.timeToAcceptRequest,
          stopsInBetweenDestination: response.setting.stopsInBetweenDestination,
          stripePublicKey: response.setting.stripePublicKey,
          stripeSecretKey: response.setting.stripeSecretKey,
          messagingSID: response.setting.messagingSID,
          messagingAuthToken: response.setting.messagingAuthToken,
          mailClientID: response.setting.mailClientID,
          mailClientSecret: response.setting.mailClientSecret
        });
        this._toastrService.success("Data has been updated successfully");
      },
      error: (error) => {
        this._toastrService.error("Error while updating the data","");
      },
      complete: () => {}
    })
  }
}
