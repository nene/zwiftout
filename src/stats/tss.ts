import { Interval } from "../ast";

// Training Stress Score formula from Training and Racing with a Power Meter:
//
// TSS = (s * W * IF) / (FTP * 3600) * 100
//
// s - duration in seconds
// W - power in watts
// IF - intensity factor (power / FTP)

const steadyTss = (duration: number, intensity: number): number => {
  return ((duration * intensity * intensity) / 3600) * 100;
};

const rangeTss = (duration: number, from: number, to: number): number => {
  let score = 0;
  const step = 1;
  for (let i = 0; i < duration; i += step) {
    let intensity = from + (to - from) * (i / duration);
    score += steadyTss(step, intensity);
  }
  return score;
};

const intervalTss = ({ duration, intensity }: Interval): number => {
  if (intensity.from === intensity.to) {
    return steadyTss(duration, intensity.from);
  } else {
    return rangeTss(duration, intensity.from, intensity.to);
  }
};

export const tss = (intervals: Interval[]): number => {
  return intervals.map(intervalTss).reduce((a, b) => a + b, 0);
};
