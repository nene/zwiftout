import { Workout, Interval, Comment } from "../ast";
import { ValidationError } from "./ValidationError";

const isCommentWithinInterval = (comment: Comment, interval: Interval): boolean => {
  return comment.offset.seconds < interval.duration.seconds;
};

const validateCommentOffsets = (interval: Interval) => {
  for (const comment of interval.comments) {
    if (!isCommentWithinInterval(comment, interval)) {
      throw new ValidationError(`Comment "@ ${comment.offset.seconds} ${comment.text}" has offset outside of interval`);
    }
  }
};

export const validate = (workout: Workout): Workout => {
  workout.intervals.forEach(validateCommentOffsets);
  return workout;
};
