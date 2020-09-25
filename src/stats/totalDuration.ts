import { map, sum } from "ramda";
import { Interval } from "../ast";
import { Seconds } from "../Seconds";

export const totalDuration = (intervals: Interval[]): Seconds =>
  new Seconds(sum(map((interval) => interval.duration.value, intervals)));
