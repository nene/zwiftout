import { xp } from "./xp";
import { Interval } from "../ast";
import { Duration } from "../Duration";
import { ConstantIntensity, RangeIntensity } from "../Intensity";
import { RepeatedInterval } from "../detectRepeats";

describe("xp()", () => {
  describe("ConstantIntensity interval", () => {
    const createTestInterval = (seconds: number): Interval => ({
      type: "Interval",
      duration: new Duration(seconds),
      intensity: new ConstantIntensity(100),
      comments: [],
    });

    [
      [1, 0],
      [2, 0],
      [5, 0],
      [10, 1],
      [15, 2],
      [30, 5],
      [45, 8],
      [50, 8],
      [55, 9],
      [56, 10],
      [57, 10],
      [58, 10],
      [59, 10],
      [60, 10],
      [61, 10],
      [62, 11],
      [63, 11],
      [64, 11],
      [65, 11],
      [1, 0],
      [1, 0],
    ].forEach(([seconds, expectedXp]) => {
      it(`${seconds}s produces ${expectedXp} XP`, () => {
        expect(xp([createTestInterval(seconds)])).toEqual(expectedXp);
      });
    });
  });

  describe("RangeIntensity interval", () => {
    const createTestInterval = (seconds: number): Interval => ({
      type: "Warmup",
      duration: new Duration(seconds),
      intensity: new RangeIntensity(50, 75),
      comments: [],
    });

    [
      [55, 5],
      [56, 5],
      [57, 5],
      [58, 5],
      [59, 5],
      [60, 6],
      [61, 6],
      [5 * 60, 30],
    ].forEach(([seconds, expectedXp]) => {
      it(`${seconds}s produces ${expectedXp} XP`, () => {
        expect(xp([createTestInterval(seconds)])).toEqual(expectedXp);
      });
    });
  });

  describe("Repeated interval", () => {
    const createTestInterval = (seconds: number): RepeatedInterval => ({
      type: "repeat",
      times: 2,
      intervals: [
        {
          type: "Interval",
          duration: new Duration(seconds / 4),
          intensity: new ConstantIntensity(80),
          comments: [],
        },
        {
          type: "Interval",
          duration: new Duration(seconds / 4),
          intensity: new ConstantIntensity(70),
          comments: [],
        },
      ],
      comments: [],
    });

    [
      [4 * 15, 11], // 1 minute
      [4 * 30, 23], // 2 minutes
      [4 * 60, 47], // 4 minutes
    ].forEach(([seconds, expectedXp]) => {
      it(`${seconds}s produces ${expectedXp} XP`, () => {
        expect(xp([createTestInterval(seconds)])).toEqual(expectedXp);
      });
    });
  });
});
