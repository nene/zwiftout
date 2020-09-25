import { chain } from "ramda";
import { Interval } from "../ast";

// Converts interval to array of intensity values for each second
const intervalToIntensities = ({ duration, intensity }: Interval): number[] => {
  const intensities: number[] = [];
  const [from, to] = [intensity.start, intensity.end];
  for (let i = 0; i < duration.seconds; i++) {
    // Intensity in a single second
    intensities.push(from + (to - from) * (i / duration.seconds));
  }
  return intensities;
};

export const intervalsToIntensities = chain(intervalToIntensities);
