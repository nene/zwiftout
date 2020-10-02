import { Workout } from "../ast";
import { averageIntensity } from "./averageIntensity";
import { normalizedIntensity } from "./normalizedIntensity";
import { totalDuration } from "./totalDuration";
import { tss2 } from "./tss2";
import { zoneDistribution } from "./zoneDistribution";

// Generates statistics
export const stats = ({ intervals }: Workout): string => {
  const duration = totalDuration(intervals);
  const avgIntensity = averageIntensity(intervals);
  const normIntensity = normalizedIntensity(intervals);
  const zones = zoneDistribution(intervals);

  return `
Total duration: ${(duration.seconds / 60).toFixed()} minutes

Average intensity: ${(avgIntensity.value * 100).toFixed()}%
Normalized intensity: ${(normIntensity.value * 100).toFixed()}%

TSS: ${tss2(duration, normIntensity).toFixed()}

Zone Distribution:
${zones.map(({ name, duration }) => `${(duration.seconds / 60).toFixed().padStart(3)} min - ${name}`).join("\n")}
`;
};
