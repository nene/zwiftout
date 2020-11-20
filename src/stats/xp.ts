import { Interval } from "../ast";
import { sum } from "ramda";
import { RangeIntensity, ConstantIntensity, FreeIntensity } from "../Intensity";
import { RepeatedInterval } from "../detectRepeats";
import { totalDuration } from "./totalDuration";

const intervalXp = (interval: Interval | RepeatedInterval): number => {
  if (interval.type === "repeat") {
    // 11 XP per minute (1 XP for every 5.05 seconds)
    const duration = totalDuration(interval.intervals).seconds * interval.times;
    return Math.floor(duration / 5.05); // Suitable numbers are: 5.01 .. 5.09
  } else {
    if (interval.intensity instanceof RangeIntensity) {
      // 6 XP per minute (1XP for every 10 seconds)
      return Math.floor(interval.duration.seconds / 10);
    } else if (interval.intensity instanceof ConstantIntensity) {
      // 10 XP per minute (1XP for every 5.56 seconds)
      return Math.floor(interval.duration.seconds / 5.56);
    } else if (interval.intensity instanceof FreeIntensity) {
      // 5 XP per minute
      return Math.round(interval.duration.seconds / 60) * 5;
    } else {
      throw new Error("Unknown type of intensity");
    }
  }
};

export const xp = (intervals: (Interval | RepeatedInterval)[]): number => sum(intervals.map(intervalXp));
