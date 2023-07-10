import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AuthInterceptor } from './shared/auth.interceptor';
import { CountryComponent } from './pages/country/country.component';
import { CityComponent } from './pages/city/city.component';
import { VehiclePricingComponent } from './pages/vehicle-pricing/vehicle-pricing.component';
import { UserComponent } from './pages/user/user.component';
import { DriverListComponent } from './pages/driver-list/driver-list.component';
import { SettingComponent } from './pages/setting/setting.component';
import { CreateRideComponent } from './pages/create-ride/create-ride.component';
import { ToastrModule } from 'ngx-toastr';
import { VehicleTypeComponent } from './pages/vehicle-type/vehicle-type.component';
import { ConfirmedRideComponent } from './pages/confirmed-ride/confirmed-ride.component';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ConvertMinutesToHoursAndMinutesPipe } from './shared/convert-minutes-to-hours-and-minutes.pipe';
import { RideHistoryComponent } from './pages/ride-history/ride-history.component';
import { RunningRequestComponent } from './pages/running-request/running-request.component';
import { RideStatusPipe } from './shared/ride-status.pipe';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { MessagingService } from './shared/messaging.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserModule } from '@angular/platform-browser';
import { BnNgIdleService } from 'bn-ng-idle';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule ,POSITION,SPINNER,PB_DIRECTION,NgxUiLoaderRouterModule} from 'ngx-ui-loader';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    ToastrModule.forRoot({
      tapToDismiss: true,
      closeButton: true,
      newestOnTop: true,
      progressBar: true,
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
      positionClass: "toast-top-right",
      timeOut: 3000,
      extendedTimeOut: 3000,
    }),
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(environment.firebase),
    BrowserModule,
    NgxUiLoaderModule,
    NgxUiLoaderModule.forRoot({
      fgsColor: "#F5365C",
      bgsPosition: POSITION.centerCenter,
      bgsSize: 40,
      bgsType: SPINNER.doubleBounce, // background spinner type
      fgsType: SPINNER.foldingCube, // foreground spinner type
      pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
      pbThickness: 5, // progress bar thickness
      text:"Loading ...",
      pbColor:"#F5365C"
    }),
    NgxUiLoaderHttpModule,
    NgxUiLoaderRouterModule,
    NgxUiLoaderHttpModule.forRoot({ showForeground: true })
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    CountryComponent,
    CityComponent,
    VehiclePricingComponent,
    UserComponent,
    DriverListComponent,
    SettingComponent,
    CreateRideComponent,
    VehicleTypeComponent,
    ConfirmedRideComponent,
    ConvertMinutesToHoursAndMinutesPipe,
    RideHistoryComponent,
    RunningRequestComponent,
    RideStatusPipe,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor,
      multi: true,
    },
    DatePipe,
    MessagingService,
    AsyncPipe,
    BnNgIdleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
