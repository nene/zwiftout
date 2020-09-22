import { IntervalLabelTokenValue } from "./parser/tokenizer";
import { Seconds } from "./types";

export type Workout = {
  name: string;
  author: string;
  description: string;
  intervals: Interval[];
};

export type Interval = {
  type: IntervalLabelTokenValue;
  duration: Seconds;
  intensity: { from: number; to: number };
  cadence?: number;
  comments: Comment[];
};

export type Comment = {
  offset: Seconds;
  text: string;
};
