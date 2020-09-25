import { Interval } from "../ast";
import { Duration } from "../Duration";

// Training Stress Score formula from Training and Racing with a Power Meter:
//
// TSS = (s * W * IF) / (FTP * 3600) * 100
//
// s - duration in seconds
// W - power in watts
// IF - intensity factor (power / FTP)

const steadyTss = (duration: Duration, intensity: number): number => {
  return ((duration.seconds * intensity * intensity) / 3600) * 100;
};

const rangeTss = (duration: Duration, from: number, to: number): number => {
  let score = 0;
  const step = new Duration(1);
  for (let i = 0; i < duration.seconds; i += step.seconds) {
    const intensity = from + (to - from) * (i / duration.seconds);
    score += steadyTss(step, intensity);
  }
  return score;
};

const intervalTss = ({ duration, intensity }: Interval): number => {
  if (intensity.start === intensity.end) {
    return steadyTss(duration, intensity.value);
  } else {
    return rangeTss(duration, intensity.start, intensity.end);
  }
};

export const tss = (intervals: Interval[]): number => {
  return intervals.map(intervalTss).reduce((a, b) => a + b, 0);
};
