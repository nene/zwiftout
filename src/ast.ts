import { IntervalLabelTokenValue } from "./tokenizer";

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
};
