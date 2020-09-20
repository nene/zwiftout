import { chain, pipe, sum } from "ramda";
import { Interval } from "./ast";

// Converts interval to array of intensity values for each second
const intervalToIntensities = ({ duration, intensity }: Interval): number[] => {
  const seconds = [];
  const { from, to } = intensity;
  for (let i = 0; i < duration; i++) {
    // Intensity in a single second
    seconds.push(from + (to - from) * (i / duration));
  }
  return seconds;
};

// Starting at the beginning of the data, calculate 30-second rolling average
const windowSize = 30;
const rollingAverages = (intensities: number[]): number[] => {
  if (intensities.length < windowSize) {
    throw new Error(`Workout must be at least ${windowSize} seconds long`);
  }
  const averages: number[] = [];
  let rollingSum: number = sum(intensities.slice(0, windowSize));
  averages.push(rollingSum / windowSize);
  for (let i = 0; i < intensities.length - windowSize; i++) {
    rollingSum -= intensities[i];
    rollingSum += intensities[i + windowSize];
    averages.push(rollingSum / windowSize);
  }
  return averages;
};

const fourthPower = (x: number) => Math.pow(x, 4);

const fourthRoot = (x: number) => Math.pow(x, 1 / 4);

const average = (arr: number[]) => sum(arr) / arr.length;

export const normalizedIntensity = (intervals: Interval[]): number => {
  return pipe(
    chain(intervalToIntensities),
    rollingAverages,
    (averages) => averages.map(fourthPower),
    average,
    fourthRoot
  )(intervals);
};
