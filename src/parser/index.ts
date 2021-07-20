import { Workout } from "../ast";
import { fillRangeIntensities } from "./fillRangeIntensities";
import { parseTokens } from "./parser";
import { tokenize } from "./tokenizer";
import { validate } from "./validate";

export const parse = (source: string): Workout => validate(fillRangeIntensities(parseTokens(tokenize(source))));
