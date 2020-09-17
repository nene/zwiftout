export enum RuleType {
  Name = "Name",
  Author = "Author",
  Description = "Description",
  Warmup = "Warmup",
  Rest = "Rest",
  Interval = "Interval",
  Cooldown = "Cooldown",
}

export type Rule = {
  type: RuleType;
  params: Param[];
};

export enum ParamType {
  Text = "Text",
  Power = "Power",
  PowerRange = "PowerRange",
  Cadence = "Cadence",
  Duration = "Duration",
}

export type TextParam = { type: ParamType.Text; value: string };
export type PowerParam = { type: ParamType.Power; value: number };
export type PowerRangeParam = {
  type: ParamType.PowerRange;
  value: [number, number];
};
export type CadenceParam = { type: ParamType.Cadence; value: number };
export type DurationParam = { type: ParamType.Duration; value: number };

export type Param =
  | TextParam
  | PowerParam
  | PowerRangeParam
  | CadenceParam
  | DurationParam;
