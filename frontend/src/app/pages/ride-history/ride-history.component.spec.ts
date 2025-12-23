import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideHistoryComponent } from './ride-history.component';
import {TestingModule} from "../../testing/testing.module";

describe('RideHistoryComponent', () => {
  let component: RideHistoryComponent;
  let fixture: ComponentFixture<RideHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RideHistoryComponent ],
      imports: [TestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
