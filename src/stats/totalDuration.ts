import { Interval } from "../ast";
import { Seconds } from "../Seconds";

export const totalDuration = (intervals: Interval[]): Seconds =>
  intervals.reduce((total, interval) => total.add(interval.duration), new Seconds(0));
