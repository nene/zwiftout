import { Workout, Interval } from "../ast";
import { ValidationError } from "./ValidationError";

const validateCommentOffsets = (interval: Interval) => {
  for (const comment of interval.comments) {
    if (comment.offset.seconds >= interval.duration.seconds) {
      throw new ValidationError(`Comment offset is larger than interval length`, comment.loc);
    }
    if (comment.offset.seconds < 0) {
      throw new ValidationError(`Negative comment offset is larger than interval length`, comment.loc);
    }
  }
};

export const validate = (workout: Workout): Workout => {
  workout.intervals.forEach(validateCommentOffsets);
  return workout;
};
