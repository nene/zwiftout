import { Interval } from "../ast";
import { Duration } from "../Duration";
import { intensityValueToZoneType, ZoneType } from "../ZoneType";
import { intervalsToIntensityNumbers } from "./intervalsToIntensityNumbers";

type NumericZoneDuration = { name: string; duration: number };
type ZoneDuration = { name: string; duration: Duration };

const emptyZones = (): Record<ZoneType, NumericZoneDuration> => ({
  Z1: { name: "Z1: Recovery", duration: 0 },
  Z2: { name: "Z2: Endurance", duration: 0 },
  Z3: { name: "Z3: Tempo", duration: 0 },
  Z4: { name: "Z4: Threshold", duration: 0 },
  Z5: { name: "Z5: VO2 Max", duration: 0 },
  Z6: { name: "Z6: Anaerobic", duration: 0 },
  free: { name: "Freeride", duration: 0 },
});

export const zoneDistribution = (intervals: Interval[]): ZoneDuration[] => {
  const zones = emptyZones();

  intervalsToIntensityNumbers(intervals).forEach((intensity) => {
    zones[intensityValueToZoneType(intensity)].duration++;
  });

  return Object.values(zones).map(({ duration, ...rest }) => ({ duration: new Duration(duration), ...rest }));
};
