export class Duration {
  constructor(readonly seconds: number) {}

  add(other: Duration): Duration {
    return new Duration(this.seconds + other.seconds);
  }
}
