export interface Intensity {
  readonly value: number;
  readonly start: number;
  readonly end: number;
}

export class ConstantIntensity implements Intensity {
  constructor(private _value: number) {}

  get value() {
    return this._value;
  }

  get start() {
    return this._value;
  }

  get end() {
    return this._value;
  }
}

export class RangeIntensity implements Intensity {
  constructor(private _start: number, private _end: number) {}

  get value() {
    return this._start;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }
}

export class FreeIntensity implements Intensity {
  get value() {
    return 0;
  }

  get start() {
    return 0;
  }

  get end() {
    return 0;
  }
}
