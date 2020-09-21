import { Workout } from "../ast";
import { parseTokens } from "./parser";
import { tokenize } from "./tokenizer";

export const parse = (source: string): Workout => parseTokens(tokenize(source));
