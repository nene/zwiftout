import { pluck, sum } from "ramda";
import { Interval } from "../ast";

export const totalDuration = (intervals: Interval[]) => sum(pluck("duration", intervals));
