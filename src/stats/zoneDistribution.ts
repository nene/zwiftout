import { Interval } from "../ast";
import { Duration } from "../Duration";
import { intervalsToIntensityNumbers } from "./intervalsToIntensityNumbers";

type Zone = {
  from: number;
  to: number;
  name: string;
};

type NumericZoneDuration = Zone & { duration: number };
type ZoneDuration = Zone & { duration: Duration };

// Intensity ranges based on https://zwiftinsider.com/power-zone-colors/
const emptyZones = (): NumericZoneDuration[] => [
  { from: 0.0, to: 0.6, name: "Z1: Recovery", duration: 0 },
  { from: 0.6, to: 0.75, name: "Z2: Endurance", duration: 0 },
  { from: 0.75, to: 0.9, name: "Z3: Tempo", duration: 0 },
  { from: 0.9, to: 1.05, name: "Z4: Threshold", duration: 0 },
  { from: 1.05, to: 1.18, name: "Z5: VO2 Max", duration: 0 },
  { from: 1.18, to: Infinity, name: "Z6: Anaerobic", duration: 0 },
];

export const zoneDistribution = (intervals: Interval[]): ZoneDuration[] => {
  const zones = emptyZones();

  intervalsToIntensityNumbers(intervals).forEach((intensity) => {
    const zone = zones.find((zone) => intensity >= zone.from && intensity < zone.to);
    if (zone) {
      zone.duration++;
    }
  });

  return zones.map(({ duration, ...rest }) => ({ duration: new Duration(duration), ...rest }));
};
