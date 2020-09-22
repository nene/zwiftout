import { pipe, sum } from "ramda";
import { Interval } from "../ast";
import { average } from "./average";
import { intervalsToIntensities } from "./intervalsToIntensities";

// Starting at the beginning of the data, calculate 30-second rolling average
const windowSize = 30; // equals to nr of seconds, but also to nr of entries in intensities array
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

export const normalizedIntensity = (intervals: Interval[]): number => {
  return pipe(
    intervalsToIntensities,
    rollingAverages,
    (averages) => averages.map(fourthPower),
    average,
    fourthRoot,
  )(intervals);
};
