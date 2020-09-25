import { Interval } from "./ast";
import { detectRepeats } from "./detectRepeats";
import { Duration } from "./Duration";
import { Intensity, IntensityRange } from "./Intensity";

describe("detectRepeats()", () => {
  it("does nothing with empty array", () => {
    expect(detectRepeats([])).toEqual([]);
  });

  it("does nothing when no interval repeats", () => {
    const intervals: Interval[] = [
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
      { type: "Interval", duration: new Duration(30), intensity: new Intensity(1.2), comments: [] },
      { type: "Cooldown", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual(intervals);
  });

  it("detects whole workout consisting of repetitions", () => {
    const intervals: Interval[] = [
      { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual([
      {
        type: "repeat",
        times: 4,
        intervals: [
          { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), comments: [] },
          { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
        ],
        comments: [],
      },
    ]);
  });

  it("detects repetitions in the middle of workout", () => {
    const intervals: Interval[] = [
      { type: "Warmup", duration: new Duration(60), intensity: new IntensityRange(0.5, 1), comments: [] },
      { type: "Rest", duration: new Duration(120), intensity: new Intensity(0.2), comments: [] },
      { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Rest", duration: new Duration(120), intensity: new Intensity(0.2), comments: [] },
      { type: "Cooldown", duration: new Duration(60), intensity: new IntensityRange(1, 0.5), comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual([
      { type: "Warmup", duration: new Duration(60), intensity: new IntensityRange(0.5, 1), comments: [] },
      { type: "Rest", duration: new Duration(120), intensity: new Intensity(0.2), comments: [] },
      {
        type: "repeat",
        times: 4,
        intervals: [
          { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
          { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
        ],
        comments: [],
      },
      { type: "Rest", duration: new Duration(120), intensity: new Intensity(0.2), comments: [] },
      { type: "Cooldown", duration: new Duration(60), intensity: new IntensityRange(1, 0.5), comments: [] },
    ]);
  });

  it("detects multiple repetitions", () => {
    const intervals: Interval[] = [
      { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(100), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(100), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(100), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(100), intensity: new Intensity(0.5), comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual([
      {
        type: "repeat",
        times: 2,
        intervals: [
          { type: "Interval", duration: new Duration(60), intensity: new Intensity(1), comments: [] },
          { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
        ],
        comments: [],
      },
      {
        type: "repeat",
        times: 2,
        intervals: [
          { type: "Interval", duration: new Duration(100), intensity: new Intensity(1), comments: [] },
          { type: "Rest", duration: new Duration(100), intensity: new Intensity(0.5), comments: [] },
        ],
        comments: [],
      },
    ]);
  });

  it("takes cadence differences into account", () => {
    const intervals: Interval[] = [
      { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), cadence: 100, comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), cadence: 80, comments: [] },
      { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), cadence: 100, comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), cadence: 80, comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual([
      { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), comments: [] },
      { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), comments: [] },
      {
        type: "repeat",
        times: 2,
        intervals: [
          { type: "Interval", duration: new Duration(120), intensity: new Intensity(1), cadence: 100, comments: [] },
          { type: "Rest", duration: new Duration(60), intensity: new Intensity(0.5), cadence: 80, comments: [] },
        ],
        comments: [],
      },
    ]);
  });

  it("does not consider warmup/cooldown-range intervals to be repeatable", () => {
    const intervals: Interval[] = [
      { type: "Warmup", duration: new Duration(60), intensity: new IntensityRange(0.1, 1), comments: [] },
      { type: "Cooldown", duration: new Duration(120), intensity: new IntensityRange(1, 0.5), comments: [] },
      { type: "Warmup", duration: new Duration(60), intensity: new IntensityRange(0.1, 1), comments: [] },
      { type: "Cooldown", duration: new Duration(120), intensity: new IntensityRange(1, 0.5), comments: [] },
      { type: "Warmup", duration: new Duration(60), intensity: new IntensityRange(0.1, 1), comments: [] },
      { type: "Cooldown", duration: new Duration(120), intensity: new IntensityRange(1, 0.5), comments: [] },
      { type: "Warmup", duration: new Duration(60), intensity: new IntensityRange(0.1, 1), comments: [] },
      { type: "Cooldown", duration: new Duration(120), intensity: new IntensityRange(1, 0.5), comments: [] },
    ];
    expect(detectRepeats(intervals)).toEqual(intervals);
  });

  it("gathers comments together", () => {
    const intervals: Interval[] = [
      {
        type: "Interval",
        duration: new Duration(100),
        intensity: new Intensity(1),
        comments: [
          { offset: new Duration(0), text: "Let's start" },
          { offset: new Duration(20), text: "Stay strong!" },
          { offset: new Duration(90), text: "Finish it!" },
        ],
      },
      {
        type: "Rest",
        duration: new Duration(100),
        intensity: new Intensity(0.5),
        comments: [
          { offset: new Duration(0), text: "Huh... have a rest" },
          { offset: new Duration(80), text: "Ready for next?" },
        ],
      },
      {
        type: "Interval",
        duration: new Duration(100),
        intensity: new Intensity(1),
        comments: [
          { offset: new Duration(0), text: "Bring it on again!" },
          { offset: new Duration(50), text: "Half way" },
          { offset: new Duration(90), text: "Almost there!" },
        ],
      },
      {
        type: "Rest",
        duration: new Duration(100),
        intensity: new Intensity(0.5),
        comments: [
          { offset: new Duration(30), text: "Wow... you did it!" },
          { offset: new Duration(40), text: "Nice job." },
          { offset: new Duration(50), text: "Until next time..." },
        ],
      },
    ];
    expect(detectRepeats(intervals)).toEqual([
      {
        type: "repeat",
        times: 2,
        intervals: [
          { type: "Interval", duration: new Duration(100), intensity: new Intensity(1), comments: [] },
          { type: "Rest", duration: new Duration(100), intensity: new Intensity(0.5), comments: [] },
        ],
        comments: [
          { offset: new Duration(0), text: "Let's start" },
          { offset: new Duration(20), text: "Stay strong!" },
          { offset: new Duration(90), text: "Finish it!" },

          { offset: new Duration(100), text: "Huh... have a rest" },
          { offset: new Duration(180), text: "Ready for next?" },

          { offset: new Duration(200), text: "Bring it on again!" },
          { offset: new Duration(250), text: "Half way" },
          { offset: new Duration(290), text: "Almost there!" },

          { offset: new Duration(330), text: "Wow... you did it!" },
          { offset: new Duration(340), text: "Nice job." },
          { offset: new Duration(350), text: "Until next time..." },
        ],
      },
    ]);
  });
});
