import { Interval } from "../ast";
import { Duration } from "../Duration";
import { ConstantIntensity, RangeIntensity } from "../Intensity";
import { chunkRangeIntervals } from "./chunkRangeIntervals";

describe("chunkRangeIntervals()", () => {
  const minute = new Duration(60);

  it("does nothing with empty array", () => {
    expect(chunkRangeIntervals([], minute)).toEqual([]);
  });

  it("does nothing with constant-intensity intervals", () => {
    const intervals: Interval[] = [
      {
        type: "Interval",
        duration: new Duration(2 * 60),
        intensity: new ConstantIntensity(0.7),
        comments: [],
      },
      {
        type: "Interval",
        duration: new Duration(10 * 60),
        intensity: new ConstantIntensity(1),
        comments: [],
      },
      {
        type: "Rest",
        duration: new Duration(30),
        intensity: new ConstantIntensity(0.5),
        comments: [],
      },
    ];

    expect(chunkRangeIntervals(intervals, minute)).toEqual(intervals);
  });

  it("converts 1-minute range-interval to 1-minute constant-interval", () => {
    expect(
      chunkRangeIntervals(
        [
          {
            type: "Warmup",
            duration: minute,
            intensity: new RangeIntensity(0.5, 1),
            comments: [],
          },
        ],
        minute,
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "comments": Array [],
          "duration": Duration {
            "seconds": 60,
          },
          "intensity": ConstantIntensity {
            "_value": 0.75,
          },
          "type": "Warmup",
        },
      ]
    `);
  });

  it("splits 3-minute range-interval to three 1-minute constant-intervals", () => {
    expect(
      chunkRangeIntervals(
        [
          {
            type: "Warmup",
            duration: new Duration(3 * 60),
            intensity: new RangeIntensity(0.5, 1),
            comments: [],
          },
        ],
        minute,
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "comments": Array [],
          "duration": Duration {
            "seconds": 60,
          },
          "intensity": ConstantIntensity {
            "_value": 0.5833333333333334,
          },
          "type": "Warmup",
        },
        Object {
          "comments": Array [],
          "duration": Duration {
            "seconds": 60,
          },
          "intensity": ConstantIntensity {
            "_value": 0.75,
          },
          "type": "Warmup",
        },
        Object {
          "comments": Array [],
          "duration": Duration {
            "seconds": 60,
          },
          "intensity": ConstantIntensity {
            "_value": 0.9166666666666667,
          },
          "type": "Warmup",
        },
      ]
    `);
  });

  it("splits 1:30 range-interval to 1min & 30sec constant-intervals", () => {
    expect(
      chunkRangeIntervals(
        [
          {
            type: "Warmup",
            duration: new Duration(60 + 30),
            intensity: new RangeIntensity(0.5, 1),
            comments: [],
          },
        ],
        minute,
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "comments": Array [],
          "duration": Duration {
            "seconds": 60,
          },
          "intensity": ConstantIntensity {
            "_value": 0.6666666666666666,
          },
          "type": "Warmup",
        },
        Object {
          "comments": Array [],
          "duration": Duration {
            "seconds": 30,
          },
          "intensity": ConstantIntensity {
            "_value": 0.9166666666666667,
          },
          "type": "Warmup",
        },
      ]
    `);
  });
});
