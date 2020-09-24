import { map, sum } from "ramda";
import { Interval } from "../ast";
import { Seconds } from "../types";

export const totalDuration = (intervals: Interval[]): Seconds =>
  new Seconds(sum(map((interval) => interval.duration.value, intervals)));
