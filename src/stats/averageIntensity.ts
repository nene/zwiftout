import { pipe } from "ramda";
import { Interval } from "../ast";
import { ConstantIntensity } from "../Intensity";
import { average } from "./average";
import { intervalsToIntensityNumbers } from "./intervalsToIntensityNumbers";

export const averageIntensity = (intervals: Interval[]): ConstantIntensity => {
  return new ConstantIntensity(pipe(intervalsToIntensityNumbers, average)(intervals));
};
