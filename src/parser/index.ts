import { Workout } from "../ast";
import { parseTokens } from "./parser";
import { tokenize } from "./tokenizer";
import { validate } from "./validate";

export const parse = (source: string): Workout => validate(parseTokens(tokenize(source)));
