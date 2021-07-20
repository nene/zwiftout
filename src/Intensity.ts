import { intensityValueToZoneType, ZoneType } from "./ZoneType";

export interface Intensity {
  readonly value: number;
  readonly start: number;
  readonly end: number;
  readonly zone: ZoneType;
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

  get zone() {
    return intensityValueToZoneType(this._value);
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

  get zone() {
    return intensityValueToZoneType(this.value);
  }
}

export class RangeIntensityEnd implements Intensity {
  constructor(private _end: number) {}

  get value() {
    return this._end;
  }

  get start(): number {
    throw new Error("RangeIntensityEnd has no start");
  }

  get end() {
    return this._end;
  }

  get zone() {
    return intensityValueToZoneType(this.value);
  }
}

export class FreeIntensity implements Intensity {
  get value() {
    // To match Zwift, which gives 64 TSS for 1h of freeride.
    return 0.8;
  }

  get start() {
    return this.value;
  }

  get end() {
    return this.value;
  }

  get zone() {
    return "free" as ZoneType;
  }
}
