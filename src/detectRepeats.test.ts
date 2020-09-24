import { Interval } from "./ast";
import { detectRepeats } from "./detectRepeats";
import { Seconds } from "./types";

describe("detectRepeats()", () => {
  it("does nothing with empty array", () => {
    expect(detectRepeats([])).toEqual([]);
  });

  it("does nothing when no interval repeats", () => {
    const intervals: Interval[] = [
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Interval", duration: new Seconds(30), intensity: { from: 1.2, to: 1.2 }, comments: [] },
      { type: "Cooldown", duration: new Seconds(60), intensity: { from: 1, to: 0.5 }, comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual(intervals);
  });

  it("detects whole workout consisting of repetitions", () => {
    const intervals: Interval[] = [
      { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual([
      {
        type: "repeat",
        times: 4,
        intervals: [
          { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, comments: [] },
          { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
        ],
        comments: [],
      },
    ]);
  });

  it("detects repetitions in the middle of workout", () => {
    const intervals: Interval[] = [
      { type: "Warmup", duration: new Seconds(60), intensity: { from: 0.5, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(120), intensity: { from: 0.2, to: 0.2 }, comments: [] },
      { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Rest", duration: new Seconds(120), intensity: { from: 0.2, to: 0.2 }, comments: [] },
      { type: "Cooldown", duration: new Seconds(60), intensity: { from: 1, to: 0.5 }, comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual([
      { type: "Warmup", duration: new Seconds(60), intensity: { from: 0.5, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(120), intensity: { from: 0.2, to: 0.2 }, comments: [] },
      {
        type: "repeat",
        times: 4,
        intervals: [
          { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
          { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
        ],
        comments: [],
      },
      { type: "Rest", duration: new Seconds(120), intensity: { from: 0.2, to: 0.2 }, comments: [] },
      { type: "Cooldown", duration: new Seconds(60), intensity: { from: 1, to: 0.5 }, comments: [] },
    ]);
  });

  it("does not consider warmup/cooldown-range intervals to be repeatable", () => {
    const intervals: Interval[] = [
      { type: "Warmup", duration: new Seconds(60), intensity: { from: 0.1, to: 1 }, comments: [] },
      { type: "Cooldown", duration: new Seconds(120), intensity: { from: 1, to: 0.5 }, comments: [] },
      { type: "Warmup", duration: new Seconds(60), intensity: { from: 0.1, to: 1 }, comments: [] },
      { type: "Cooldown", duration: new Seconds(120), intensity: { from: 1, to: 0.5 }, comments: [] },
      { type: "Warmup", duration: new Seconds(60), intensity: { from: 0.1, to: 1 }, comments: [] },
      { type: "Cooldown", duration: new Seconds(120), intensity: { from: 1, to: 0.5 }, comments: [] },
      { type: "Warmup", duration: new Seconds(60), intensity: { from: 0.1, to: 1 }, comments: [] },
      { type: "Cooldown", duration: new Seconds(120), intensity: { from: 1, to: 0.5 }, comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual(intervals);
  });
});
