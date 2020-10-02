import { Duration } from "../Duration";
import { Intensity } from "../Intensity";

// Training Stress Score formula from Training and Racing with a Power Meter:
//
// TSS = (s * W * IF) / (FTP * 3600) * 100
//
// s - duration in seconds
// W - power in watts
// IF - intensity factor (power / FTP)
//
// Derive a formula without power values, using intensities alone:
//
// TSS = (s * (FTP * IF) * IF) / (FTP * 3600) * 100
// TSS = (s * IF * IF) / 3600 * 100

export const tss = (duration: Duration, intensity: Intensity): number => {
  return ((duration.seconds * Math.pow(intensity.value, 2)) / 3600) * 100;
};
