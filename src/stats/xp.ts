import { Interval } from "../ast";
import { sum } from "ramda";
import { RangeIntensity, ConstantIntensity, FreeIntensity } from "../Intensity";

const intervalXp = ({ intensity, duration }: Interval): number => {
  if (intensity instanceof RangeIntensity) {
    // 6 XP per minute (1XP for every 10 seconds)
    return Math.floor(duration.seconds / 10);
  } else if (intensity instanceof ConstantIntensity) {
    // 10 XP per minute (1XP for every 5.56 seconds)
    return Math.floor(duration.seconds / 5.56);
  } else if (intensity instanceof FreeIntensity) {
    // 5 XP per minute
    return Math.round(duration.seconds / 60) * 5;
  } else {
    throw new Error("Unknown type of intensity");
  }
};

export const xp = (intervals: Interval[]): number => sum(intervals.map(intervalXp));
