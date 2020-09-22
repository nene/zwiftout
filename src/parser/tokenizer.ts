import { ParseError } from "./ParseError";

export type HeaderLabelTokenValue = "Name" | "Author" | "Description";
export type IntervalLabelTokenValue = "Warmup" | "Rest" | "Interval" | "Cooldown";
export type LabelTokenValue = HeaderLabelTokenValue | IntervalLabelTokenValue;

export const isHeaderLabelTokenValue = (value: string): value is HeaderLabelTokenValue => {
  return ["Name", "Author", "Description"].includes(value);
};
export const isIntervalLabelTokenValue = (value: string): value is IntervalLabelTokenValue => {
  return ["Warmup", "Rest", "Interval", "Cooldown"].includes(value);
};
export const isLabelTokenValue = (value: string): value is LabelTokenValue => {
  return isHeaderLabelTokenValue(value) || isIntervalLabelTokenValue(value);
};

// 0-based row and column indexes. First line is 0th.
export type SourceLocation = {
  row: number;
  col: number;
};

export type LabelToken = {
  type: "label";
  value: LabelTokenValue;
  loc: SourceLocation;
};
export type TextToken = {
  type: "text";
  value: string;
  loc: SourceLocation;
};
export type NumberToken = {
  type: "intensity" | "cadence" | "duration";
  value: number;
  loc: SourceLocation;
};
export type IntensityRangeToken = {
  type: "intensity-range";
  value: [number, number];
  loc: SourceLocation;
};
export type CommentStartToken = {
  type: "comment-start";
  value?: undefined;
  loc: SourceLocation;
};
export type Token = LabelToken | TextToken | NumberToken | IntensityRangeToken | CommentStartToken;

const toInteger = (str: string): number => {
  return parseInt(str.replace(/[^0-9]/, ""), 10);
};

const toSeconds = (str: string): number => {
  const [seconds, minutes, hours] = str.split(":").map(toInteger).reverse();
  return seconds + minutes * 60 + (hours || 0) * 60 * 60;
};

const toFraction = (percentage: number): number => percentage / 100;

const DURATION_REGEX = /^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}$/;

const tokenizeValueParam = (text: string, loc: SourceLocation): Token => {
  if (DURATION_REGEX.test(text)) {
    return { type: "duration", value: toSeconds(text), loc };
  }
  if (/^[0-9]+rpm$/.test(text)) {
    return { type: "cadence", value: toInteger(text), loc };
  }
  if (/^[0-9]+%..[0-9]+%$/.test(text)) {
    const [from, to] = text.split("..").map(toInteger).map(toFraction);
    return { type: "intensity-range", value: [from, to], loc };
  }
  if (/^[0-9]+%$/.test(text)) {
    return { type: "intensity", value: toFraction(toInteger(text)), loc };
  }
  throw new ParseError(`Unrecognized interval parameter "${text}"`, loc);
};

const tokenizeParams = (text: string, loc: SourceLocation): Token[] => {
  return text.split(/\s+/).map((rawParam) => {
    return tokenizeValueParam(rawParam, {
      row: loc.row,
      // Not fully accurate, but should do for start
      col: loc.col + text.indexOf(rawParam),
    });
  });
};

const tokenizeLabelTokenParams = (type: LabelTokenValue, text: string, loc: SourceLocation): Token[] => {
  switch (type) {
    case "Name":
    case "Author":
    case "Description": {
      return [{ type: "text", value: text, loc }];
    }
    case "Warmup":
    case "Rest":
    case "Interval":
    case "Cooldown":
      return tokenizeParams(text, loc);
  }
};

const tokenizeComment = (line: string, row: number): Token[] | undefined => {
  const [, commentHead, offset, commentText] = line.match(/^(\s*#\s*)([0-9:]+)(.*?)$/) || [];
  if (!commentHead) {
    return undefined;
  }
  if (!DURATION_REGEX.test(offset)) {
    throw new ParseError("Invalid comment offset", { row, col: commentHead.length });
  }
  return [
    { type: "comment-start", loc: { row, col: line.indexOf("#") } },
    { type: "duration", value: toSeconds(offset), loc: { row, col: commentHead.length } },
    { type: "text", value: commentText.trim(), loc: { row, col: commentHead.length + offset.length } },
  ];
};

const tokenizeLabelToken = (line: string, row: number): Token[] | undefined => {
  const [, label, separator, paramString] = line.match(/^(\w+)(:\s*)(.*?)\s*$/) || [];
  if (!label) {
    return undefined;
  }
  if (!isLabelTokenValue(label)) {
    throw new ParseError(`Unknown label "${label}:"`, { row, col: 0 });
  }
  const labelToken: LabelToken = {
    type: "label",
    value: label as LabelTokenValue,
    loc: { row, col: 0 },
  };
  const params = tokenizeLabelTokenParams(labelToken.value, paramString, {
    row,
    col: label.length + separator.length,
  });
  return [labelToken, ...params];
};

const tokenizeRule = (line: string, row: number): Token[] => {
  return (
    tokenizeLabelToken(line, row) ||
    tokenizeComment(line, row) || [{ type: "text", value: line.trim(), loc: { row, col: 0 } }]
  );
};

export const tokenize = (file: string): Token[] => {
  const tokens: Token[] = [];

  file.split("\n").map((line, row) => {
    tokens.push(...tokenizeRule(line, row));
  });

  return tokens;
};
