export class ValidationError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
