import { IntervalType } from "./parser/tokenizer";
import { Duration } from "./Duration";
import { Intensity, IntensityRange } from "./Intensity";

export type Workout = {
  name: string;
  author: string;
  description: string;
  intervals: Interval[];
};

export type Interval = {
  type: IntervalType;
  duration: Duration;
  intensity: Intensity | IntensityRange;
  cadence?: number;
  comments: Comment[];
};

export type Comment = {
  offset: Duration;
  text: string;
};
