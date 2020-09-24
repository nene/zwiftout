import { map, sum } from "ramda";
import { Interval } from "../ast";
import { Seconds } from "../types";

export const totalDuration = (intervals: Interval[]): Seconds =>
  new Seconds(sum(map((i) => i.duration.value, intervals)));
