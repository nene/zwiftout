import { Interval } from "../ast";
import { Duration } from "../Duration";
import { ConstantIntensity, RangeIntensity } from "../Intensity";
import { normalizedIntensity } from "./normalizedIntensity";

const round = (intensity: ConstantIntensity) => Math.round(intensity.value * 100) / 100;

describe("normalizedIntensity()", () => {
  it("when no intervals, returns 0 for all zones", () => {
    expect(round(normalizedIntensity([]))).toEqual(0);
  });

  it("returns plain average for < 30-seconds workout", () => {
    expect(
      round(
        normalizedIntensity([
          {
            type: "Interval",
            duration: new Duration(10),
            intensity: new ConstantIntensity(0.5),
            comments: [],
          },
          {
            type: "Interval",
            duration: new Duration(10),
            intensity: new ConstantIntensity(0.7),
            comments: [],
          },
        ]),
      ),
    ).toEqual(0.6);
  });

  it("is the intensity of an interval for single-interval workout", () => {
    const intervals: Interval[] = [
      {
        type: "Interval",
        duration: new Duration(20 * 60),
        intensity: new ConstantIntensity(0.75),
        comments: [],
      },
    ];
    expect(round(normalizedIntensity(intervals))).toEqual(0.75);
  });

  it("leans towards higher intensity for two-interval workout", () => {
    const intervals: Interval[] = [
      {
        type: "Interval",
        duration: new Duration(10 * 60),
        intensity: new ConstantIntensity(0.5),
        comments: [],
      },
      {
        type: "Interval",
        duration: new Duration(10 * 60),
        intensity: new ConstantIntensity(1.0),
        comments: [],
      },
    ];
    expect(round(normalizedIntensity(intervals))).toEqual(0.85);
  });

  it("handles range-intensities", () => {
    const intervals: Interval[] = [
      {
        type: "Warmup",
        duration: new Duration(20 * 60),
        intensity: new RangeIntensity(0.5, 1.0),
        comments: [],
      },
    ];
    expect(round(normalizedIntensity(intervals))).toEqual(0.79);
  });
});
