import * as xml from "xml";
import { Interval, Workout, Comment } from "./ast";
import { detectRepeats, RepeatedInterval } from "./detectRepeats";

// Zwift Workout XML generator

const generateTextEvents = (comments: Comment[]): xml.XmlObject[] => {
  return comments.map(({ offset, text }) => ({
    textevent: [{ _attr: { timeoffset: offset.seconds, message: text } }],
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
          Duration: duration.seconds,
          PowerLow: intensity.from,
          PowerHigh: intensity.to,
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
          Duration: duration.seconds,
          Power: intensity.from,
          ...(cadence ? { Cadence: cadence } : {}),
        },
      },
      ...generateTextEvents(comments),
    ],
  };
};

const generateRepeatInterval = (repInterval: RepeatedInterval): xml.XmlObject => {
  const [on, off] = repInterval.intervals;
  return {
    IntervalsT: [
      {
        _attr: {
          Repeat: repInterval.times,

          OnDuration: on.duration.seconds,
          OnPower: on.intensity.from,
          ...(on.cadence ? { Cadence: on.cadence } : {}),

          OffDuration: off.duration.seconds,
          OffPower: off.intensity.from,
          ...(off.cadence ? { CadenceResting: off.cadence } : {}),
        },
      },
      ...generateTextEvents(repInterval.comments),
    ],
  };
};

const generateInterval = (interval: Interval | RepeatedInterval): xml.XmlObject => {
  if (interval.type === "repeat") {
    return generateRepeatInterval(interval);
  }

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
        ...detectRepeats(intervals).map(generateInterval),
      ],
    },
    { indent: "  " },
  );
};
