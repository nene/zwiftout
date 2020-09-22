import * as xml from "xml";
import { Interval, Workout, Comment } from "./ast";

// Zwift Workout XML generator

const generateTextEvents = (comments: Comment[]): xml.XmlObject[] => {
  return comments.map(({ offset, text }) => ({
    textevent: [{ _attr: { timeoffset: offset, message: text } }],
  }));
};

const generateRangeInterval = (
  tagName: "Warmup" | "Cooldown",
  { duration, intensity, cadence, comments }: Interval,
): xml.XmlObject => {
  return {
    [tagName]: [
      {
        _attr: {
          Duration: duration.value,
          PowerLow: intensity.from,
          PowerHigh: intensity.from,
          ...(cadence ? { Cadence: cadence } : {}),
        },
      },
      ...generateTextEvents(comments),
    ],
  };
};

const generateSteadyStateInterval = ({ duration, intensity, cadence, comments }: Interval): xml.XmlObject => {
  return {
    SteadyState: [
      {
        _attr: {
          Duration: duration.value,
          Power: intensity.from,
          ...(cadence ? { Cadence: cadence } : {}),
        },
      },
      ...generateTextEvents(comments),
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
