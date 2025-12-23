import { ConvertMinutesToHoursAndMinutesPipe } from './convert-minutes-to-hours-and-minutes.pipe';

describe('ConvertMinutesToHoursAndMinutesPipe', () => {
  const pipe = new ConvertMinutesToHoursAndMinutesPipe();

  it('formats durations longer than one hour', () => {
    expect(pipe.transform(125)).toBe('2 hr 5 min');
  });

  it('formats durations under an hour', () => {
    expect(pipe.transform(45)).toBe('45 min');
  });

  it('handles zero minutes', () => {
    expect(pipe.transform(0)).toBe('0 min');
  });
});
