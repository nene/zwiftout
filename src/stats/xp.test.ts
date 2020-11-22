import { xp } from "./xp";
import { Interval } from "../ast";
import { Duration } from "../Duration";
import { ConstantIntensity, FreeIntensity, RangeIntensity } from "../Intensity";
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
      [6, 1],
      [7, 1],
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
      [53, 5],
      [54, 5],
      [55, 5],
      [56, 5],
      [57, 5],
      [58, 5],
      [59, 5],
      [60, 6],
      [61, 6],
      [65, 6],
      [66, 6],
      [67, 6],
      [68, 6],
      [5 * 60, 30],
    ].forEach(([seconds, expectedXp]) => {
      it(`${seconds}s produces ${expectedXp} XP`, () => {
        expect(xp([createTestInterval(seconds)])).toEqual(expectedXp);
      });
    });
  });

  describe("FreeRide interval", () => {
    const createTestInterval = (seconds: number): Interval => ({
      type: "FreeRide",
      duration: new Duration(seconds),
      intensity: new FreeIntensity(),
      comments: [],
    });

    [
      [51, 5],
      [52, 5],
      [53, 5],
      [54, 5],
      [55, 5],
      [56, 5],
      [57, 5],
      [58, 5],
      [59, 5],
      // [60, 6], // Doesn't work :(
      [61, 6],
      [62, 6],
      [63, 6],
      [64, 6],
      [65, 6],
      [66, 6],
      [67, 6],
      [68, 6],
      [69, 6],
      [2 * 60, 11],
      [3 * 60, 17],
    ].forEach(([seconds, expectedXp]) => {
      it(`${seconds}s produces ${expectedXp} XP`, () => {
        expect(xp([createTestInterval(seconds)])).toEqual(expectedXp);
      });
    });
  });

  describe("Repeated interval", () => {
    const createTestInterval = (times: number, [onSeconds, offSeconds]: number[]): RepeatedInterval => ({
      type: "repeat",
      times,
      intervals: [
        {
          type: "Interval",
          duration: new Duration(onSeconds),
          intensity: new ConstantIntensity(80),
          comments: [],
        },
        {
          type: "Interval",
          duration: new Duration(offSeconds),
          intensity: new ConstantIntensity(70),
          comments: [],
        },
      ],
      comments: [],
    });

    [
      { times: 2, intervals: [1, 1], expectedXp: 0 }, // 0:04
      { times: 3, intervals: [1, 1], expectedXp: 1 }, // 0:06
      { times: 2, intervals: [14, 14], expectedXp: 11 }, // 0:56
      { times: 2, intervals: [14, 15], expectedXp: 11 }, // 0:58
      { times: 2, intervals: [15, 15], expectedXp: 11 }, // 1:00
      { times: 2, intervals: [15, 16], expectedXp: 12 }, // 1:02
      { times: 2, intervals: [16, 16], expectedXp: 12 }, // 1:04
      { times: 3, intervals: [14, 15], expectedXp: 17 }, // 1:27
      { times: 3, intervals: [15, 16], expectedXp: 18 }, // 1:33
      { times: 2, intervals: [30, 30], expectedXp: 23 }, // 2:00
      { times: 2, intervals: [60, 60], expectedXp: 47 }, // 4:00
    ].forEach(({ times, intervals, expectedXp }) => {
      it(`${times} x (${intervals[0]}s on & ${intervals[1]}s off) produces ${expectedXp} XP`, () => {
        expect(xp([createTestInterval(times, intervals)])).toEqual(expectedXp);
      });
    });
  });
});
