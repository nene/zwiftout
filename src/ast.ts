import { IntervalType } from "./parser/tokenizer";
import { Duration } from "./Duration";

export type Workout = {
  name: string;
  author: string;
  description: string;
  intervals: Interval[];
};

export type Interval = {
  type: IntervalType;
  duration: Duration;
  intensity: { from: number; to: number };
  cadence?: number;
  comments: Comment[];
};

export type Comment = {
  offset: Duration;
  text: string;
};
