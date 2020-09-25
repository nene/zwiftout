export class Duration {
  constructor(readonly value: number) {}

  add(other: Duration): Duration {
    return new Duration(this.value + other.value);
  }
}
