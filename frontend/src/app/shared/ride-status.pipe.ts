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
        return 'Assigning';
        
      case 3 :
        return 'Accepted';

      case 4 :
        return 'Arrived';
        
      case 5 :
        return 'Started';

      case 6 : 
        return 'Completed';
    }
    return null;
  }

}