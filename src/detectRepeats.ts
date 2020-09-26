import { eqProps, flatten, zip } from "ramda";
import { Interval, Comment } from "./ast";
import { Duration } from "./Duration";
import { IntensityRange } from "./Intensity";

export type RepeatedInterval = {
  type: "repeat";
  times: number;
  intervals: Interval[];
  comments: Comment[];
};

// All fields besides comments must equal
const equalIntervals = (a: Interval, b: Interval): boolean =>
  eqProps("type", a, b) && eqProps("duration", a, b) && eqProps("intensity", a, b) && eqProps("cadence", a, b);

const equalIntervalArrays = (as: Interval[], bs: Interval[]): boolean =>
  zip(as, bs).every(([a, b]) => equalIntervals(a, b));

const windowSize = 2;

const countRepetitions = (reference: Interval[], intervals: Interval[], startIndex: number): number => {
  let repeats = 1;
  while (startIndex + repeats * windowSize < intervals.length) {
    const from = startIndex + repeats * windowSize;
    const possibleRepeat = intervals.slice(from, from + windowSize);
    if (equalIntervalArrays(reference, possibleRepeat)) {
      repeats++;
    } else {
      return repeats;
    }
  }
  return repeats;
};

const offsetComments = (interval: Interval, baseOffset: Duration): Comment[] => {
  return interval.comments.map(({ offset, ...rest }) => ({
    offset: baseOffset.add(offset),
    ...rest,
  }));
};

const collectComments = (intervals: Interval[]): Comment[] => {
  let previousIntervalsDuration = new Duration(0);
  return flatten(
    intervals.map((interval) => {
      const comments = offsetComments(interval, previousIntervalsDuration);
      previousIntervalsDuration = previousIntervalsDuration.add(interval.duration);
      return comments;
    }),
  );
};

const stripComments = (intervals: Interval[]): Interval[] => {
  return intervals.map(({ comments, ...rest }) => ({ comments: [], ...rest }));
};

const extractRepeatedInterval = (intervals: Interval[], i: number): RepeatedInterval | undefined => {
  const reference = intervals.slice(i, i + windowSize);
  const repeats = countRepetitions(reference, intervals, i);
  if (repeats === 1) {
    return undefined;
  }

  return {
    type: "repeat",
    times: repeats,
    intervals: stripComments(reference),
    comments: collectComments(intervals.slice(i, i + windowSize * repeats)),
  };
};

const isRangeInterval = (interval: Interval): boolean => interval.intensity instanceof IntensityRange;

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

    const repeatedInterval = extractRepeatedInterval(intervals, i);
    if (repeatedInterval) {
      processed.push(repeatedInterval);
      i += repeatedInterval.times * windowSize;
    } else {
      processed.push(intervals[i]);
      i++;
    }
  }

  return processed;
};
