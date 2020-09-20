import { pipe, sum } from "ramda";
import { Interval } from "./ast";
import { intervalsToIntensities } from "./intervalsToIntensities";

const average = (arr: number[]) => sum(arr) / arr.length;

export const averageIntensity = (intervals: Interval[]): number => {
  return pipe(intervalsToIntensities, average)(intervals);
};
