import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SettingService } from 'src/app/shared/setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {

  public settingForm: FormGroup;
  public customErrMsg: string = '';
  public timeCountList: any = [10,20,30,45,60,90,120];
  public stopCountList: any = [1,2,3,4,5];
  private id: string;

  constructor(private _settingService: SettingService) { }

  ngOnInit(): void {

    this.getSettingData();

    this.settingForm = new FormGroup({
      timeToAcceptRequest: new FormControl(null, [Validators.required]),
      stopsInBetweenDestination: new FormControl(null, [Validators.required])
    })
  }

  getSettingData() {
    this._settingService.getSettingData().subscribe({
      next: (response) => {
        this.id = response.setting[0]._id;
        this.settingForm.patchValue({
          timeToAcceptRequest: response.setting[0].timeToAcceptRequest,
          stopsInBetweenDestination: response.setting[0].stopsInBetweenDestination,
        });
      },
      error: (error) => {
        this.customErrMsg = error.error.message
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
        });
        this.customErrMsg = "Data updated successfully";

        setTimeout(() => {
          this.customErrMsg = '';
        }, 5000);
      },
      error: (error) => {
        this.customErrMsg = error.error.msg;
      },
      complete: () => {}
    })
  }
}
