import { Interval, Workout } from "../ast";
import { FreeIntensity, RangeIntensity, RangeIntensityEnd } from "../Intensity";

const fillIntensities = (prevInterval: Interval, interval: Interval): Interval => {
  if (!(interval.intensity instanceof RangeIntensityEnd)) {
    return interval;
  }

  if (prevInterval.intensity instanceof FreeIntensity) {
    throw new Error("range-intensity-end interval can't be after free-intensity interval");
  }

  return {
    ...interval,
    intensity: new RangeIntensity(prevInterval.intensity.end, interval.intensity.end),
  };
};

// Given: [1, 2, 3, 4]
// Returns: [[1,2], [2,3], [3,4]]
const pairs = <T>(arr: T[]): T[][] => {
  const result: T[][] = [];
  for (let i = 1; i < arr.length; i++) {
    result.push([arr[i - 1], arr[i]]);
  }
  return result;
};

const fillIntensitiesInIntervals = (intervals: Interval[]): Interval[] => {
  if (intervals.length <= 1) {
    if (intervals.length === 1 && intervals[0].intensity instanceof RangeIntensityEnd) {
      throw new Error("range-intensity-end interval can't be the first interval");
    }
    return intervals;
  }

  return [intervals[0], ...pairs(intervals).map(([prev, curr]) => fillIntensities(prev, curr))];
};

export const fillRangeIntensities = (workout: Workout): Workout => {
  return {
    ...workout,
    intervals: fillIntensitiesInIntervals(workout.intervals),
  };
};
