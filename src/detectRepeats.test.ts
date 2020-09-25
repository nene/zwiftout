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

  it("detects multiple repetitions", () => {
    const intervals: Interval[] = [
      { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(100), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(100), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(100), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(100), intensity: { from: 0.5, to: 0.5 }, comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual([
      {
        type: "repeat",
        times: 2,
        intervals: [
          { type: "Interval", duration: new Seconds(60), intensity: { from: 1, to: 1 }, comments: [] },
          { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
        ],
        comments: [],
      },
      {
        type: "repeat",
        times: 2,
        intervals: [
          { type: "Interval", duration: new Seconds(100), intensity: { from: 1, to: 1 }, comments: [] },
          { type: "Rest", duration: new Seconds(100), intensity: { from: 0.5, to: 0.5 }, comments: [] },
        ],
        comments: [],
      },
    ]);
  });

  it("takes cadence differences into account", () => {
    const intervals: Interval[] = [
      { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, cadence: 100, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, cadence: 80, comments: [] },
      { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, cadence: 100, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, cadence: 80, comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual([
      { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, comments: [] },
      { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, comments: [] },
      {
        type: "repeat",
        times: 2,
        intervals: [
          { type: "Interval", duration: new Seconds(120), intensity: { from: 1, to: 1 }, cadence: 100, comments: [] },
          { type: "Rest", duration: new Seconds(60), intensity: { from: 0.5, to: 0.5 }, cadence: 80, comments: [] },
        ],
        comments: [],
      },
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

  it("gathers comments together", () => {
    const intervals: Interval[] = [
      {
        type: "Interval",
        duration: new Seconds(100),
        intensity: { from: 1, to: 1 },
        comments: [
          { offset: new Seconds(0), text: "Let's start" },
          { offset: new Seconds(20), text: "Stay strong!" },
          { offset: new Seconds(90), text: "Finish it!" },
        ],
      },
      {
        type: "Rest",
        duration: new Seconds(100),
        intensity: { from: 0.5, to: 0.5 },
        comments: [
          { offset: new Seconds(0), text: "Huh... have a rest" },
          { offset: new Seconds(80), text: "Ready for next?" },
        ],
      },
      {
        type: "Interval",
        duration: new Seconds(100),
        intensity: { from: 1, to: 1 },
        comments: [
          { offset: new Seconds(0), text: "Bring it on again!" },
          { offset: new Seconds(50), text: "Half way" },
          { offset: new Seconds(90), text: "Almost there!" },
        ],
      },
      {
        type: "Rest",
        duration: new Seconds(100),
        intensity: { from: 0.5, to: 0.5 },
        comments: [
          { offset: new Seconds(30), text: "Wow... you did it!" },
          { offset: new Seconds(40), text: "Nice job." },
          { offset: new Seconds(50), text: "Until next time..." },
        ],
      },
    ];
    expect(detectRepeats(intervals)).toEqual([
      {
        type: "repeat",
        times: 2,
        intervals: [
          { type: "Interval", duration: new Seconds(100), intensity: { from: 1, to: 1 }, comments: [] },
          { type: "Rest", duration: new Seconds(100), intensity: { from: 0.5, to: 0.5 }, comments: [] },
        ],
        comments: [
          { offset: new Seconds(0), text: "Let's start" },
          { offset: new Seconds(20), text: "Stay strong!" },
          { offset: new Seconds(90), text: "Finish it!" },

          { offset: new Seconds(100), text: "Huh... have a rest" },
          { offset: new Seconds(180), text: "Ready for next?" },

          { offset: new Seconds(200), text: "Bring it on again!" },
          { offset: new Seconds(250), text: "Half way" },
          { offset: new Seconds(290), text: "Almost there!" },

          { offset: new Seconds(330), text: "Wow... you did it!" },
          { offset: new Seconds(340), text: "Nice job." },
          { offset: new Seconds(350), text: "Until next time..." },
        ],
      },
    ]);
  });
});
