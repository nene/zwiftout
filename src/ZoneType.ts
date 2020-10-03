export type ZoneType = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "Z6" | "free";

// Intensity ranges based on https://zwiftinsider.com/power-zone-colors/
export const intensityValueToZoneType = (intensity: number): ZoneType => {
  if (intensity >= 1.18) {
    return "Z6";
  }
  if (intensity >= 1.05) {
    return "Z5";
  }
  if (intensity >= 0.9) {
    return "Z4";
  }
  if (intensity >= 0.75) {
    return "Z3";
  }
  if (intensity >= 0.6) {
    return "Z2";
  }
  return "Z1";
};
