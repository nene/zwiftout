import { Duration } from "../Duration";

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

export const tss2 = (duration: Duration, intensity: number): number => {
  return ((duration.seconds * intensity * intensity) / 3600) * 100;
};
