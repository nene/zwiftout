import { Interval } from "../ast";
import { Duration } from "../Duration";
import { ConstantIntensity, RangeIntensity } from "../Intensity";
import { zoneDistribution } from "./zoneDistribution";

const testZoneDistribution = (intervals: Interval[]) =>
  zoneDistribution(intervals).map(({ name, duration }) => [name, duration.seconds]);

describe("zoneDistribution()", () => {
  it("when no intervals, returns 0 for all zones", () => {
    expect(testZoneDistribution([])).toEqual([
      ["Z1: Recovery", 0],
      ["Z2: Endurance", 0],
      ["Z3: Tempo", 0],
      ["Z4: Threshold", 0],
      ["Z5: VO2 Max", 0],
      ["Z6: Anaerobic", 0],
      ["Freeride", 0],
    ]);
  });

  it("sums up durations falling within single intensity range", () => {
    const intervals: Interval[] = [
      {
        type: "Interval",
        duration: new Duration(100),
        intensity: new ConstantIntensity(0.9), // lower bound of Z4
        comments: [],
      },
      {
        type: "Interval",
        duration: new Duration(100),
        intensity: new ConstantIntensity(1.0), // middle of of Z4
        comments: [],
      },
      {
        type: "Interval",
        duration: new Duration(100),
        intensity: new ConstantIntensity(1.04), // upper bound of of Z4
        comments: [],
      },
    ];
    expect(testZoneDistribution(intervals)).toEqual([
      ["Z1: Recovery", 0],
      ["Z2: Endurance", 0],
      ["Z3: Tempo", 0],
      ["Z4: Threshold", 300],
      ["Z5: VO2 Max", 0],
      ["Z6: Anaerobic", 0],
      ["Freeride", 0],
    ]);
  });

  it("distributes interval lengths to respective zones", () => {
    const intervals: Interval[] = [
      {
        type: "Interval",
        duration: new Duration(100),
        intensity: new ConstantIntensity(1.0), // Z4
        comments: [],
      },
      {
        type: "Interval",
        duration: new Duration(50),
        intensity: new ConstantIntensity(0.1), // Z1
        comments: [],
      },
      {
        type: "Interval",
        duration: new Duration(10),
        intensity: new ConstantIntensity(2.0), // Z6
        comments: [],
      },
    ];
    expect(testZoneDistribution(intervals)).toEqual([
      ["Z1: Recovery", 50],
      ["Z2: Endurance", 0],
      ["Z3: Tempo", 0],
      ["Z4: Threshold", 100],
      ["Z5: VO2 Max", 0],
      ["Z6: Anaerobic", 10],
      ["Freeride", 0],
    ]);
  });

  it("splits range-intensity interval duration between multiple zones", () => {
    const intervals: Interval[] = [
      {
        type: "Interval",
        duration: new Duration(100),
        intensity: new RangeIntensity(0.6, 0.9), // Z2..Z3
        comments: [],
      },
    ];
    expect(testZoneDistribution(intervals)).toEqual([
      ["Z1: Recovery", 0],
      ["Z2: Endurance", 50],
      ["Z3: Tempo", 50],
      ["Z4: Threshold", 0],
      ["Z5: VO2 Max", 0],
      ["Z6: Anaerobic", 0],
      ["Freeride", 0],
    ]);
  });
});
