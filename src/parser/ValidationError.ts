import { SourceLocation } from "./tokenizer";

export class ValidationError extends Error {
  public loc: SourceLocation;
  constructor(msg: string, loc: SourceLocation) {
    super(`${msg} at line ${loc.row + 1} char ${loc.col + 1}`);
    this.loc = loc;
  }
}
