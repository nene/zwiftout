import { Workout } from "../ast";
import { detectRepeats } from "../detectRepeats";
import { Duration } from "../Duration";
import { Intensity } from "../Intensity";
import { averageIntensity } from "./averageIntensity";
import { normalizedIntensity } from "./normalizedIntensity";
import { totalDuration } from "./totalDuration";
import { tss } from "./tss";
import { xp } from "./xp";
import { zoneDistribution, ZoneDuration } from "./zoneDistribution";

export type Stats = {
  totalDuration: Duration;
  averageIntensity: Intensity;
  normalizedIntensity: Intensity;
  tss: number;
  xp: number;
  zones: ZoneDuration[];
};

// Generates statistics
export const stats = ({ intervals }: Workout): Stats => {
  const duration = totalDuration(intervals);
  const normIntensity = normalizedIntensity(intervals);
  return {
    totalDuration: totalDuration(intervals),
    averageIntensity: averageIntensity(intervals),
    normalizedIntensity: normalizedIntensity(intervals),
    tss: tss(duration, normIntensity),
    xp: xp(detectRepeats(intervals)),
    zones: zoneDistribution(intervals),
  };
};

export const formatStats = ({ totalDuration, averageIntensity, normalizedIntensity, tss, xp, zones }: Stats) => {
  return `
Total duration: ${(totalDuration.seconds / 60).toFixed()} minutes

Average intensity: ${(averageIntensity.value * 100).toFixed()}%
Normalized intensity: ${(normalizedIntensity.value * 100).toFixed()}%

TSS: ${tss.toFixed()}
XP: ${xp}

Zone Distribution:
${zones.map(({ name, duration }) => `${(duration.seconds / 60).toFixed().padStart(3)} min - ${name}`).join("\n")}
`;
};
