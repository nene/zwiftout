export class Seconds {
  constructor(readonly value: number) {}

  add(other: Seconds): Seconds {
    return new Seconds(this.value + other.value);
  }
}
