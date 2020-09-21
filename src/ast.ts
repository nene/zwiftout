import { IntervalLabelTokenValue } from "./parser/tokenizer";

export type Workout = {
  name: string;
  author: string;
  description: string;
  intervals: Interval[];
};

export type Interval = {
  type: IntervalLabelTokenValue;
  duration: number;
  intensity: { from: number; to: number };
  cadence?: number;
  comments: Comment[];
};

export type Comment = {
  offset: number;
  text: string;
};
