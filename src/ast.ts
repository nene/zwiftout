import { IntervalType } from "./parser/tokenizer";
import { Seconds } from "./Seconds";

export type Workout = {
  name: string;
  author: string;
  description: string;
  intervals: Interval[];
};

export type Interval = {
  type: IntervalType;
  duration: Seconds;
  intensity: { from: number; to: number };
  cadence?: number;
  comments: Comment[];
};

export type Comment = {
  offset: Seconds;
  text: string;
};
