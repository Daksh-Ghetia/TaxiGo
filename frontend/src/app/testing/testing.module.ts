import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService, ActiveToast, IndividualConfig } from 'ngx-toastr';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { of } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

const fakeToast = {} as ActiveToast<any>;

const angularFireMessagingMock: Partial<AngularFireMessaging> = {
  messages: of(null),
  requestToken: of(null),
  getToken: of(null as any),
  tokenChanges: of(null as any),
  deleteToken: () => of(true),
};

export const toastrServiceMock: Partial<ToastrService> = {
  success: (
    message?: string,
    title?: string,
    override?: Partial<IndividualConfig>
  ) => fakeToast,

  error: (
    message?: string,
    title?: string,
    override?: Partial<IndividualConfig>
  ) => fakeToast,

  info: (
    message?: string,
    title?: string,
    override?: Partial<IndividualConfig>
  ) => fakeToast,

  warning: (
    message?: string,
    title?: string,
    override?: Partial<IndividualConfig>
  ) => fakeToast,

  clear: (_toastId?: number) => {},
  remove: (_toastId?: number) => true,
};

@NgModule({
  imports: [
    HttpClientTestingModule,
    NoopAnimationsModule,
    NgxPaginationModule,
  ],
  exports: [
    HttpClientTestingModule,
    NoopAnimationsModule,
    NgxPaginationModule,
  ],
  providers: [
    { provide: ToastrService, useValue: toastrServiceMock },
    { provide: AngularFireMessaging, useValue: angularFireMessagingMock }
  ],
})
export class TestingModule {}

function ensureGoogleMapsMock() {
  const w = window as any;

  if (w.google) return;

  w.google = {
    maps: {
      // constants / enums
      MapTypeId: { ROADMAP: 'ROADMAP' },

      // constructors
      Map: function () {},
      Marker: function () {},
      Polygon: function () {},
      InfoWindow: function () {
        return { open: () => {}, close: () => {}, setPosition: () => {}, setContent: () => {} };
      },

      ControlPosition: {
        TOP_CENTER: 'TOP_CENTER',
        TOP_LEFT: 'TOP_LEFT',
        TOP_RIGHT: 'TOP_RIGHT',
        LEFT_TOP: 'LEFT_TOP',
        RIGHT_TOP: 'RIGHT_TOP',
        LEFT_CENTER: 'LEFT_CENTER',
        RIGHT_CENTER: 'RIGHT_CENTER',
        LEFT_BOTTOM: 'LEFT_BOTTOM',
        RIGHT_BOTTOM: 'RIGHT_BOTTOM',
        BOTTOM_CENTER: 'BOTTOM_CENTER',
        BOTTOM_LEFT: 'BOTTOM_LEFT',
        BOTTOM_RIGHT: 'BOTTOM_RIGHT',
      },

      Geocoder: function () {
        return {
          geocode: (_req: any, cb: any) => cb([], 'OK'),
        };
      },

      DirectionsService: function () {
        return {
          route: (_req: any, cb: any) => cb({ routes: [] }, 'OK'),
        };
      },

      DirectionsRenderer: function () {
        return { setMap: () => {}, setDirections: () => {} };
      },

      LatLng: function () {},
      LatLngBounds: function () {
        return { extend: () => {} };
      },

      places: {
        Autocomplete: function () {
          return {
            addListener: () => {},
            getPlace: () => ({
              geometry: { location: { lat: () => 0, lng: () => 0 } },
            }),
          };
        },
      },

      event: {
        addListener: () => {},
        clearInstanceListeners: () => {},
        trigger: () => {},
      },

      geometry: {
        poly: { containsLocation: () => false },
      },

      Animation: { DROP: 'DROP' },

      drawing: {
        OverlayType: {
          POLYGON: 'POLYGON',
          MARKER: 'MARKER',
          POLYLINE: 'POLYLINE',
          RECTANGLE: 'RECTANGLE',
          CIRCLE: 'CIRCLE',
        },

        DrawingManager: function (_opts?: any) {
          return {
            setMap: () => {},
            setOptions: () => {},
          };
        },
      },


    },
  };
}
ensureGoogleMapsMock();

