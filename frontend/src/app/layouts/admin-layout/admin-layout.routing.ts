import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { VehicleTypeComponent } from 'src/app/pages/vehicle-type/vehicle-type.component';
import { CountryComponent } from 'src/app/pages/country/country.component';
import { CityComponent } from 'src/app/pages/city/city.component';
import { VehiclePricingComponent } from 'src/app/pages/vehicle-pricing/vehicle-pricing.component';
import { UserComponent } from 'src/app/pages/user/user.component';
import { DriverListComponent } from 'src/app/pages/driver-list/driver-list.component';
import { SettingComponent } from 'src/app/pages/setting/setting.component';
import { CreateRideComponent } from 'src/app/pages/create-ride/create-ride.component';
import { ConfirmedRideComponent } from 'src/app/pages/confirmed-ride/confirmed-ride.component';
import { RideHistoryComponent } from 'src/app/pages/ride-history/ride-history.component';
import { RunningRequestComponent } from 'src/app/pages/running-request/running-request.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'user-profile',   component: UserProfileComponent},
    { path: 'tables',         component: TablesComponent},
    { path: 'icons',          component: IconsComponent},
    { path: 'maps',           component: MapsComponent},
    { path: 'vehicleType',    component: VehicleTypeComponent},
    { path: 'country',        component: CountryComponent},
    { path: 'city',           component: CityComponent},
    { path: 'vehiclePricing', component: VehiclePricingComponent},
    { path: 'users',          component: UserComponent},
    { path: 'driverList',     component: DriverListComponent},
    { path: 'createRide',     component: CreateRideComponent},
    { path: 'confirmedRide',  component: ConfirmedRideComponent},
    { path: 'rideHistory',    component: RideHistoryComponent},
    { path: 'runningRequest',    component: RunningRequestComponent},

    

    { path: 'setting',     component: SettingComponent},

];
