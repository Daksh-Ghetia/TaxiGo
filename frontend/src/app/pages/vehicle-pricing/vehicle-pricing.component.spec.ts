import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclePricingComponent } from './vehicle-pricing.component';
import {TestingModule} from "../../testing/testing.module";

describe('VehiclePricingComponent', () => {
  let component: VehiclePricingComponent;
  let fixture: ComponentFixture<VehiclePricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehiclePricingComponent ],
      imports: [TestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiclePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
