import { Workout, Interval } from "../ast";
import { ValidationError } from "./ValidationError";

const validateCommentOffsets = ({ comments, duration }: Interval) => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.offset.seconds >= duration.seconds) {
      throw new ValidationError(`Comment offset is larger than interval length`, comment.loc);
    }
    if (comment.offset.seconds < 0) {
      throw new ValidationError(`Negative comment offset is larger than interval length`, comment.loc);
    }
    if (i > 0 && comment.offset.seconds <= comments[i - 1].offset.seconds) {
      throw new ValidationError(`Comment overlaps previous comment`, comment.loc);
    }
    if (i > 0 && comment.offset.seconds < comments[i - 1].offset.seconds + 10) {
      throw new ValidationError(`Less than 10 seconds between comments`, comment.loc);
    }
    if (comment.offset.seconds + 10 > duration.seconds) {
      throw new ValidationError(`Less than 10 seconds between comment start and interval end`, comment.loc);
    }
  }
};

export const validate = (workout: Workout): Workout => {
  workout.intervals.forEach(validateCommentOffsets);
  return workout;
};
