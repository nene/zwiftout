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

const toInteger = (str: string): number => {
  return parseInt(str.replace(/[^0-9]/, ""), 10);
};

const toSeconds = (str: string): number => {
  const [seconds, minutes, hours] = str.split(":").map(toInteger).reverse();
  return seconds + minutes * 60 + (hours || 0) * 60 * 60;
};

const tokenizeValueParam = (text: string): Param => {
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

const tokenizeParams = (type: RuleType, text: string): Param[] => {
  switch (type) {
    case RuleType.Name:
    case RuleType.Author:
    case RuleType.Description: {
      return [{ type: ParamType.Text, value: text }];
    }
    case RuleType.Warmup:
    case RuleType.Rest:
    case RuleType.Interval:
    case RuleType.Cooldown:
      return text.split(" ").map(tokenizeValueParam);
  }
};

const tokenizeRule = (line: string): Rule | undefined => {
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
    params: tokenizeParams(type, matches[2].trim()),
  };
};

export const tokenizeFile = (file: string): Rule[] => {
  const tokens: Rule[] = [];

  file.split("\n").forEach((line) => {
    const rule = tokenizeRule(line);
    if (rule) {
      tokens.push(rule);
      return;
    }
    const lastToken = tokens[tokens.length - 1];
    if (lastToken && lastToken.type === RuleType.Description) {
      lastToken.params.push({ type: ParamType.Text, value: line.trim() });
    }
  });

  return tokens;
};
