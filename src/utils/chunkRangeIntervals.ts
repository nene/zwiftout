import { chain, curry } from "ramda";
import { Interval } from "../ast";
import { Duration } from "../Duration";
import { ConstantIntensity, Intensity } from "../Intensity";

const chunkDuration = (seconds: number, chunkSize: Duration, intervalDuration: Duration): Duration => {
  return seconds + chunkSize.seconds > intervalDuration.seconds
    ? new Duration(intervalDuration.seconds % chunkSize.seconds)
    : chunkSize;
};

const chunkIntensity = (
  startSeconds: number,
  chunkSize: Duration,
  { start, end }: Intensity,
  intervalDuration: Duration,
): ConstantIntensity => {
  const endSeconds =
    startSeconds + chunkSize.seconds > intervalDuration.seconds
      ? intervalDuration.seconds
      : startSeconds + chunkSize.seconds;

  const middleSeconds = (startSeconds + endSeconds) / 2;

  return new ConstantIntensity(start + (end - start) * (middleSeconds / intervalDuration.seconds));
};

const chunkInterval = curry((chunkSize: Duration, interval: Interval): Interval[] => {
  if (interval.intensity.start === interval.intensity.end) {
    return [interval];
  }

  const intervals: Interval[] = [];
  for (let seconds = 0; seconds < interval.duration.seconds; seconds += chunkSize.seconds) {
    intervals.push({
      ...interval,
      duration: chunkDuration(seconds, chunkSize, interval.duration),
      intensity: chunkIntensity(seconds, chunkSize, interval.intensity, interval.duration),
      comments: [], // TODO: for now, ignoring comments
    });
  }
  return intervals;
});

/**
 * Breaks intervals that use RangeIntensity into multiple intervals with ConstantIntensity
 */
export const chunkRangeIntervals = (intervals: Interval[], chunkSize: Duration): Interval[] =>
  chain(chunkInterval(chunkSize), intervals);
