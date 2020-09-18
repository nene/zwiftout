export type HeaderLabelTokenValue = "Name" | "Author" | "Description";
export type IntervalLabelTokenValue =
  | "Warmup"
  | "Rest"
  | "Interval"
  | "Cooldown";
export type LabelTokenValue = HeaderLabelTokenValue | IntervalLabelTokenValue;

export const isHeaderLabelTokenValue = (
  value: string
): value is HeaderLabelTokenValue => {
  return ["Name", "Author", "Description"].includes(value);
};
export const isIntervalLabelTokenValue = (
  value: string
): value is IntervalLabelTokenValue => {
  return ["Warmup", "Rest", "Interval", "Cooldown"].includes(value);
};
export const isLabelTokenValue = (value: string): value is LabelTokenValue => {
  return isHeaderLabelTokenValue(value) || isIntervalLabelTokenValue(value);
};

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
    case "Name":
    case "Author":
    case "Description": {
      return [{ type: "text", value: text }];
    }
    case "Warmup":
    case "Rest":
    case "Interval":
    case "Cooldown":
      return text.split(" ").map(tokenizeValueParam);
  }
};

const tokenizeRule = (line: string): Token[] => {
  const matches = line.match(/^(\w+):(.*)$/);
  if (!matches) {
    return [{ type: "text", value: line.trim() }];
  }
  if (!isLabelTokenValue(matches[1])) {
    return [{ type: "text", value: line.trim() }];
  }

  const labelToken: LabelToken = {
    type: "label",
    value: matches[1] as LabelTokenValue,
  };
  const params = tokenizeParams(labelToken.value, matches[2].trim());

  return [labelToken, ...params];
};

export const tokenize = (file: string): Token[] => {
  const tokens: Token[] = [];

  file.split("\n").map((line) => {
    tokens.push(...tokenizeRule(line));
  });

  return tokens;
};
