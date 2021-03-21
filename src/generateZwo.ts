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
  tagName: "Warmup" | "Cooldown" | "Ramp",
  { duration, intensity, cadence, comments }: Interval,
): xml.XmlObject => {
  return {
    [tagName]: [
      {
        _attr: {
          Duration: duration.seconds,
          PowerLow: intensity.start,
          PowerHigh: intensity.end,
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
          Power: intensity.value,
          ...(cadence ? { Cadence: cadence } : {}),
        },
      },
      ...generateTextEvents(comments),
    ],
  };
};

const generateFreeRideInterval = ({ duration, comments }: Interval): xml.XmlObject => {
  return {
    FreeRide: [
      {
        _attr: {
          Duration: duration.seconds,
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
          OnPower: on.intensity.start,
          ...(on.cadence ? { Cadence: on.cadence } : {}),

          OffDuration: off.duration.seconds,
          OffPower: off.intensity.end,
          ...(off.cadence ? { CadenceResting: off.cadence } : {}),
        },
      },
      ...generateTextEvents(repInterval.comments),
    ],
  };
};

const generateInterval = (
  interval: Interval | RepeatedInterval,
  index: number,
  allIntervals: (Interval | RepeatedInterval)[],
): xml.XmlObject => {
  if (interval.type === "repeat") {
    return generateRepeatInterval(interval);
  }

  const { intensity } = interval;
  if (index === 0 && intensity.start < intensity.end) {
    return generateRangeInterval("Warmup", interval);
  } else if (index === allIntervals.length - 1 && intensity.start > intensity.end) {
    return generateRangeInterval("Cooldown", interval);
  } else if (intensity.start !== intensity.end) {
    return generateRangeInterval("Ramp", interval);
  } else if (intensity.zone === "free") {
    return generateFreeRideInterval(interval);
  } else {
    return generateSteadyStateInterval(interval);
  }
};

const generateTag = (name: string): xml.XmlObject => {
  return {
    tag: [{ _attr: { name } }],
  };
};

export const generateZwo = ({ name, author, description, tags, intervals }: Workout): string => {
  return xml(
    {
      workout_file: [
        { name: name },
        { author: author },
        { description: description },
        { tags: tags.map(generateTag) },
        { sportType: "bike" },
        { workout: detectRepeats(intervals).map(generateInterval) },
      ],
    },
    { indent: "  " },
  );
};
