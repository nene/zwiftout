import { Interval } from "../ast";
import { Duration } from "../Duration";

export const totalDuration = (intervals: Interval[]): Duration =>
  intervals.reduce((total, interval) => total.add(interval.duration), new Duration(0));
