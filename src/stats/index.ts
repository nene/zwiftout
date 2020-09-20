import { Workout } from "../ast";
import { averageIntensity } from "./averageIntensity";
import { normalizedIntensity } from "./normalizedIntensity";
import { totalDuration } from "./totalDuration";
import { tss } from "./tss";
import { tss2 } from "./tss2";

// Generates statistics
export const stats = ({ intervals }: Workout): string => {
  const duration = totalDuration(intervals);
  const avgIntensity = averageIntensity(intervals);
  const normIntensity = normalizedIntensity(intervals);

  return `
Total duration: ${(duration / 60).toFixed()} minutes

Average intensity: ${(avgIntensity * 100).toFixed()}%
Normalized intensity: ${(normIntensity * 100).toFixed()}%

TSS #1: ${tss(intervals).toFixed()}
TSS #2: ${tss2(duration, normIntensity).toFixed()}
`;
};
