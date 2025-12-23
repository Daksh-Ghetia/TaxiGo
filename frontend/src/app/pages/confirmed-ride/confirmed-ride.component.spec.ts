import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmedRideComponent } from './confirmed-ride.component';
import {TestingModule} from "../../testing/testing.module";

describe('ConfirmedRideComponent', () => {
  let component: ConfirmedRideComponent;
  let fixture: ComponentFixture<ConfirmedRideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmedRideComponent ],
      imports: [TestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmedRideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
