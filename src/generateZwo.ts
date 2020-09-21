import * as xml from "xml";
import { Interval, Workout } from "./ast";

// Zwift Workout XML generator

const generateRangeInterval = (
  tagName: "Warmup" | "Cooldown",
  { duration, intensity, cadence }: Interval,
): xml.XmlObject => {
  return {
    [tagName]: [
      {
        _attr: {
          Duration: duration,
          PowerLow: intensity.from,
          PowerHigh: intensity.from,
          ...(cadence ? { Cadence: cadence } : {}),
        },
      },
    ],
  };
};

const generateSteadyStateInterval = ({ duration, intensity, cadence }: Interval): xml.XmlObject => {
  return {
    SteadyState: [
      {
        _attr: {
          Duration: duration,
          Power: intensity.from,
          ...(cadence ? { Cadence: cadence } : {}),
        },
      },
    ],
  };
};

const generateInterval = (interval: Interval): xml.XmlObject => {
  const { intensity } = interval;
  if (intensity.from < intensity.to) {
    return generateRangeInterval("Warmup", interval);
  } else if (intensity.from > intensity.to) {
    return generateRangeInterval("Cooldown", interval);
  } else {
    return generateSteadyStateInterval(interval);
  }
};

export const generateZwo = ({ name, author, description, intervals }: Workout): string => {
  return xml(
    {
      workout_file: [
        { name: name },
        { author: author },
        { description: description },
        { sportType: "bike" },
        ...intervals.map(generateInterval),
      ],
    },
    { indent: "  " },
  );
};
