export type Workout = {
  name: string;
  author: string;
  description: string;
  intervals: Interval[];
};

export type Interval = {
  type: "Warmup" | "Cooldown" | "Interval" | "Rest";
  duration: number;
  power: { from: number; to: number };
  cadence?: number;
};
