import { equals } from "ramda";
import { Interval } from "./ast";

export type RepeatedInterval = {
  times: number;
  intervals: Interval[];
};

const windowSize = 2;

const countRepetitions = (reference: Interval[], intervals: Interval[], startIndex: number): number => {
  let repeats = 1;
  while (startIndex + repeats * windowSize < intervals.length) {
    const from = startIndex + repeats * windowSize;
    const possibleRepeat = intervals.slice(from, from + windowSize);
    if (equals(reference, possibleRepeat)) {
      repeats++;
    } else {
      return repeats;
    }
  }
  return repeats;
};

const isRangeInterval = (interval: Interval): boolean => interval.intensity.from !== interval.intensity.to;

export const detectRepeats = (intervals: Interval[]): (Interval | RepeatedInterval)[] => {
  if (intervals.length < windowSize) {
    return intervals;
  }

  const processed: (Interval | RepeatedInterval)[] = [];
  let i = 0;
  while (i < intervals.length) {
    // Ignore warmup/cooldown-range intervals
    if (isRangeInterval(intervals[i])) {
      processed.push(intervals[i]);
      i++;
      continue;
    }

    const reference = intervals.slice(i, i + windowSize);
    const repeats = countRepetitions(reference, intervals, i);
    if (repeats > 1) {
      processed.push({
        times: repeats,
        intervals: reference,
      });
      i += repeats * windowSize;
    } else {
      processed.push(intervals[i]);
      i++;
    }
  }

  return processed;
};
