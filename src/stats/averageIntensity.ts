import { pipe } from "ramda";
import { Interval } from "../ast";
import { average } from "./average";
import { intervalsToIntensities } from "./intervalsToIntensities";

export const averageIntensity = (intervals: Interval[]): number => {
  return pipe(intervalsToIntensities, average)(intervals);
};
