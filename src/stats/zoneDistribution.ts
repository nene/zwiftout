import { Interval } from "../ast";
import { Duration } from "../Duration";
import { intervalsToIntensityNumbers } from "./intervalsToIntensityNumbers";

type NumericZoneDuration = { name: string; duration: number };
type ZoneDuration = { name: string; duration: Duration };
type ZoneIndex = 0 | 1 | 2 | 3 | 4 | 5;

const emptyZones = (): NumericZoneDuration[] => [
  { name: "Z1: Recovery", duration: 0 },
  { name: "Z2: Endurance", duration: 0 },
  { name: "Z3: Tempo", duration: 0 },
  { name: "Z4: Threshold", duration: 0 },
  { name: "Z5: VO2 Max", duration: 0 },
  { name: "Z6: Anaerobic", duration: 0 },
];

// Intensity ranges based on https://zwiftinsider.com/power-zone-colors/
const zoneIndex = (intensity: number): ZoneIndex => {
  if (intensity >= 1.18) {
    return 5;
  }
  if (intensity >= 1.05) {
    return 4;
  }
  if (intensity >= 0.9) {
    return 3;
  }
  if (intensity >= 0.75) {
    return 2;
  }
  if (intensity >= 0.6) {
    return 1;
  }
  return 0;
};

export const zoneDistribution = (intervals: Interval[]): ZoneDuration[] => {
  const zones = emptyZones();

  intervalsToIntensityNumbers(intervals).forEach((intensity) => {
    zones[zoneIndex(intensity)].duration++;
  });

  return zones.map(({ duration, ...rest }) => ({ duration: new Duration(duration), ...rest }));
};
