import * as fs from "fs";

enum RuleType {
  Name = "Name",
  Author = "Author",
  Description = "Description",
  Warmup = "Warmup",
  Rest = "Rest",
  Interval = "Interval",
  Cooldown = "Cooldown",
}

type Rule = {
  type: RuleType;
  params: Param[];
};

enum ParamType {
  Text = "Text",
  Power = "Power",
  PowerRange = "PowerRange",
  Cadence = "Cadence",
  Duration = "Duration",
}

type TextParam = { type: ParamType.Text; value: string };
type PowerParam = { type: ParamType.Power; value: number };
type PowerRangeParam = { type: ParamType.PowerRange; value: [number, number] };
type CadenceParam = { type: ParamType.Cadence; value: number };
type DurationParam = { type: ParamType.Duration; value: number };

type Param =
  | TextParam
  | PowerParam
  | PowerRangeParam
  | CadenceParam
  | DurationParam;

const toInteger = (str: string): number => {
  return parseInt(str.replace(/[^0-9]/, ""), 10);
};

const toSeconds = (str: string): number => {
  const [seconds, minutes, hours] = str.split(":").map(toInteger).reverse();
  return seconds + minutes * 60 + (hours || 0) * 60 * 60;
};

const parseValueParam = (text: string): Param => {
  if (/^[0-9:]+$/.test(text)) {
    return { type: ParamType.Duration, value: toSeconds(text) };
  }
  if (/^[0-9]+rpm$/.test(text)) {
    return { type: ParamType.Cadence, value: toInteger(text) };
  }
  if (/^[0-9]+%..[0-9]+%$/.test(text)) {
    const [from, to] = text.split("..").map(toInteger);
    return { type: ParamType.PowerRange, value: [from, to] };
  }
  if (/^[0-9]+%$/.test(text)) {
    return { type: ParamType.Power, value: toInteger(text) };
  }
  throw new Error(`Unrecognized parameter "${text}"`);
};

const parseParams = (type: RuleType, text: string): Param[] => {
  switch (type) {
    case RuleType.Name:
    case RuleType.Author:
    case RuleType.Description:
      return [{ type: ParamType.Text, value: text }];
    case RuleType.Warmup:
    case RuleType.Rest:
    case RuleType.Interval:
    case RuleType.Cooldown:
      return text.split(" ").map(parseValueParam);
  }
};

const parseRule = (line: string): Rule | undefined => {
  const matches = line.match(/^(\w+):(.*)$/);
  if (!matches) {
    return undefined;
  }
  if (!Object.keys(RuleType).includes(matches[1])) {
    return undefined;
  }
  const type: RuleType = matches[1] as RuleType;

  return {
    type,
    params: parseParams(type, matches[2].trim()),
  };
};

const isDefined = <T>(x: T | undefined): x is T => Boolean(x);

const filename = process.argv[2];

console.log(`Parsing: ${filename}`);

const file = fs.readFileSync(filename, "utf8");

file
  .split(/\n/)
  .map(parseRule)
  .filter(isDefined)
  .forEach((rule) => {
    console.log(rule.type);
    rule.params.forEach((p) => {
      console.log(`  ${p.type}: ${p.value}`);
    });
  });
