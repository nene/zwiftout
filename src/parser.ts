import { Param, ParamType, RuleType, Rule } from "./ast";

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

export const parseRule = (line: string): Rule | undefined => {
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
