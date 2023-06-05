import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rideStatus'
})
export class RideStatusPipe implements PipeTransform {

  transform(value: number): string {

    switch(value) {
      case 0 :
        return 'Cancelled';
      
      case 1 :
        return 'Pending';

      case 2 :
        return 'No driver Found';

      case 3:
        return 'Assigning';
        
      case 4 :
        return 'Accepted';

      case 5 :
        return 'Arrived';
        
      case 6 :
        return 'Started';

      case 7 : 
        return 'Completed';
    }
    return null;
  }

}
