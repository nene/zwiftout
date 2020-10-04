import { pipe, sum } from "ramda";
import { Interval } from "../ast";
import { ConstantIntensity } from "../Intensity";
import { average } from "./average";
import { intervalsToIntensityNumbers } from "./intervalsToIntensityNumbers";

// Starting at the beginning of the data, calculate 30-second rolling average
const windowSize = 30; // equals to nr of seconds, but also to nr of entries in intensities array
const rollingAverages = (intensities: number[]): number[] => {
  let rollingSum: number = sum(intensities.slice(0, windowSize));

  if (intensities.length === 0) {
    return [0];
  }
  if (intensities.length < windowSize) {
    return [rollingSum / intensities.length];
  }

  const averages: number[] = [];
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

export const normalizedIntensity = (intervals: Interval[]): ConstantIntensity => {
  return new ConstantIntensity(
    pipe(
      intervalsToIntensityNumbers,
      rollingAverages,
      (averages) => averages.map(fourthPower),
      average,
      fourthRoot,
    )(intervals),
  );
};
