export class Intensity {
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

export class IntensityRange {
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
