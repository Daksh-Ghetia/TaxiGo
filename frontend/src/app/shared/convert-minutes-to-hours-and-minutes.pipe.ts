import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertMinutesToHoursAndMinutes'
})
export class ConvertMinutesToHoursAndMinutesPipe implements PipeTransform {

  transform(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return (hours > 0) ? (hours + ' hr ' + remainingMinutes + ' min') : (remainingMinutes + ' min') ;
  }
}
