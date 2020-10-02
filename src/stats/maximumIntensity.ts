import { Interval } from "../ast";
import { ConstantIntensity } from "../Intensity";

export const maximumIntensity = (intervals: Interval[]): ConstantIntensity =>
  new ConstantIntensity(
    Math.max(...intervals.map((interval) => Math.max(interval.intensity.start, interval.intensity.end))),
  );
