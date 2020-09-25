import { pipe } from "ramda";
import { Interval } from "../ast";
import { Intensity } from "../Intensity";
import { average } from "./average";
import { intervalsToIntensityNumbers } from "./intervalsToIntensityNumbers";

export const averageIntensity = (intervals: Interval[]): Intensity => {
  return new Intensity(pipe(intervalsToIntensityNumbers, average)(intervals));
};
