import { SourceLocation } from "./tokenizer";

export class ValidationError extends Error {
  constructor(msg: string, { row, col }: SourceLocation) {
    super(`${msg} at line ${row + 1} char ${col + 1}`);
  }
}
