import { IntervalLabelTokenValue } from "./tokenizer";

export type Workout = {
  name: string;
  author: string;
  description: string;
  intervals: Interval[];
};

export type IntervalData = {
  duration: number;
  power: { from: number; to: number };
  cadence?: number;
};

export type Interval = IntervalData & {
  type: IntervalLabelTokenValue;
};
