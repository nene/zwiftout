import { eqProps, flatten, zip } from "ramda";
import { Interval, Comment } from "./ast";
import { Seconds } from "./types";

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

const offsetComments = (interval: Interval, baseOffset: Seconds): Comment[] => {
  return interval.comments.map(({ offset, ...rest }) => ({
    offset: new Seconds(baseOffset.value + offset.value),
    ...rest,
  }));
};

const collectComments = (intervals: Interval[]): Comment[] => {
  let previousIntervalsDuration = new Seconds(0);
  return flatten(
    intervals.map((interval) => {
      const comments = offsetComments(interval, previousIntervalsDuration);
      previousIntervalsDuration = new Seconds(previousIntervalsDuration.value + interval.duration.value);
      return comments;
    }),
  );
};

const stripComments = (intervals: Interval[]): Interval[] => {
  return intervals.map(({ comments, ...rest }) => ({ comments: [], ...rest }));
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
        type: "repeat",
        times: repeats,
        intervals: stripComments(reference),
        comments: collectComments(intervals.slice(i, i + windowSize * repeats)),
      });
      i += repeats * windowSize;
    } else {
      processed.push(intervals[i]);
      i++;
    }
  }

  return processed;
};
