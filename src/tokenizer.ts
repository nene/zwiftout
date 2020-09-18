export enum LabelTokenValue {
  Name = "Name",
  Author = "Author",
  Description = "Description",
  Warmup = "Warmup",
  Rest = "Rest",
  Interval = "Interval",
  Cooldown = "Cooldown",
}
export type LabelToken = {
  type: "label";
  value: LabelTokenValue;
};
export type TextToken = {
  type: "text";
  value: string;
};
export type NumberToken = {
  type: "power" | "cadence" | "duration";
  value: number;
};
export type PowerRangeToken = {
  type: "power-range";
  value: [number, number];
};
export type Token = LabelToken | TextToken | NumberToken | PowerRangeToken;

const toInteger = (str: string): number => {
  return parseInt(str.replace(/[^0-9]/, ""), 10);
};

const toSeconds = (str: string): number => {
  const [seconds, minutes, hours] = str.split(":").map(toInteger).reverse();
  return seconds + minutes * 60 + (hours || 0) * 60 * 60;
};

const tokenizeValueParam = (text: string): Token => {
  if (/^[0-9:]+$/.test(text)) {
    return { type: "duration", value: toSeconds(text) };
  }
  if (/^[0-9]+rpm$/.test(text)) {
    return { type: "cadence", value: toInteger(text) };
  }
  if (/^[0-9]+%..[0-9]+%$/.test(text)) {
    const [from, to] = text.split("..").map(toInteger);
    return { type: "power-range", value: [from, to] };
  }
  if (/^[0-9]+%$/.test(text)) {
    return { type: "power", value: toInteger(text) };
  }
  throw new Error(`Unrecognized parameter "${text}"`);
};

const tokenizeParams = (type: LabelTokenValue, text: string): Token[] => {
  switch (type) {
    case LabelTokenValue.Name:
    case LabelTokenValue.Author:
    case LabelTokenValue.Description: {
      return [{ type: "text", value: text }];
    }
    case LabelTokenValue.Warmup:
    case LabelTokenValue.Rest:
    case LabelTokenValue.Interval:
    case LabelTokenValue.Cooldown:
      return text.split(" ").map(tokenizeValueParam);
  }
};

const tokenizeRule = (line: string): Token[] => {
  const matches = line.match(/^(\w+):(.*)$/);
  if (!matches) {
    return [{ type: "text", value: line.trim() }];
  }
  if (!Object.keys(LabelTokenValue).includes(matches[1])) {
    return [{ type: "text", value: line.trim() }];
  }

  const labelToken: LabelToken = {
    type: "label",
    value: matches[1] as LabelTokenValue,
  };
  const params = tokenizeParams(labelToken.value, matches[2].trim());

  return [labelToken, ...params];
};

export const tokenizeFile = (file: string): Token[] => {
  const tokens: Token[] = [];

  file.split("\n").map((line) => {
    tokens.push(...tokenizeRule(line));
  });

  return tokens;
};
