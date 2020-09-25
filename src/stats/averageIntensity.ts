import { pipe } from "ramda";
import { Interval } from "../ast";
import { Intensity } from "../Intensity";
import { average } from "./average";
import { intervalsToIntensities } from "./intervalsToIntensities";

export const averageIntensity = (intervals: Interval[]): Intensity => {
  return new Intensity(pipe(intervalsToIntensities, average)(intervals));
};
