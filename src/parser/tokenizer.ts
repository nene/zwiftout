import { ParseError } from "./ParseError";

export type HeaderType = "Name" | "Author" | "Description";
export type IntervalType = "Warmup" | "Rest" | "Interval" | "Cooldown" | "FreeRide";

const isHeaderType = (value: string): value is HeaderType => {
  return ["Name", "Author", "Description"].includes(value);
};
const isIntervalType = (value: string): value is IntervalType => {
  return ["Warmup", "Rest", "Interval", "Cooldown", "FreeRide"].includes(value);
};

// 0-based row and column indexes. First line is 0th.
export type SourceLocation = {
  row: number;
  col: number;
};

export type HeaderToken = {
  type: "header";
  value: HeaderType;
  loc: SourceLocation;
};
export type IntervalToken = {
  type: "interval";
  value: IntervalType;
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
export type RangeIntensityToken = {
  type: "intensity-range";
  value: [number, number];
  loc: SourceLocation;
};
export type CommentStartToken = {
  type: "comment-start";
  value?: undefined;
  loc: SourceLocation;
};
export type Token = HeaderToken | IntervalToken | TextToken | NumberToken | RangeIntensityToken | CommentStartToken;

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

const tokenizeComment = (line: string, row: number): Token[] | undefined => {
  const [, commentHead, offset, commentText] = line.match(/^(\s*@\s*)([0-9:]+)(.*?)$/) || [];
  if (!commentHead) {
    return undefined;
  }
  if (!DURATION_REGEX.test(offset)) {
    throw new ParseError("Invalid comment offset", { row, col: commentHead.length });
  }
  return [
    { type: "comment-start", loc: { row, col: line.indexOf("@") } },
    { type: "duration", value: toSeconds(offset), loc: { row, col: commentHead.length } },
    { type: "text", value: commentText.trim(), loc: { row, col: commentHead.length + offset.length } },
  ];
};

const tokenizeHeader = (label: HeaderType, separator: string, paramString: string, row: number): Token[] => {
  const token: HeaderToken = {
    type: "header",
    value: label,
    loc: { row, col: 0 },
  };
  const param: TextToken = {
    type: "text",
    value: paramString,
    loc: {
      row,
      col: label.length + separator.length,
    },
  };
  return [token, param];
};

const tokenizeInterval = (label: IntervalType, separator: string, paramString: string, row: number): Token[] => {
  const token: IntervalToken = {
    type: "interval",
    value: label,
    loc: { row, col: 0 },
  };
  const params = tokenizeParams(paramString, {
    row,
    col: label.length + separator.length,
  });
  return [token, ...params];
};

const tokenizeLabeledLine = (line: string, row: number): Token[] | undefined => {
  const [, label, separator, paramString] = line.match(/^(\w+)(:\s*)(.*?)\s*$/) || [];
  if (!label) {
    return undefined;
  }

  if (isHeaderType(label)) {
    return tokenizeHeader(label, separator, paramString, row);
  }

  if (isIntervalType(label)) {
    return tokenizeInterval(label, separator, paramString, row);
  }

  throw new ParseError(`Unknown label "${label}:"`, { row, col: 0 });
};

const tokenizeText = (line: string, row: number, afterDescription: boolean): TextToken[] => {
  if (!afterDescription && line.trim() === "") {
    // Ignore empty lines in most cases.
    // They're only significant inside description.
    return [];
  }
  return [{ type: "text", value: line.trim(), loc: { row, col: 0 } }];
};

const tokenizeRule = (line: string, row: number, afterDescription: boolean): Token[] => {
  return tokenizeLabeledLine(line, row) || tokenizeComment(line, row) || tokenizeText(line, row, afterDescription);
};

// True when last token is "Description:" (optionally followed by any number of text tokens)
const isInsideDescription = (tokens: Token[]): boolean => {
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (token.type === "text") {
      continue;
    }
    return token.type === "header" && token.value === "Description";
  }
  return false;
};

export const tokenize = (file: string): Token[] => {
  const tokens: Token[] = [];

  file.split("\n").map((line, row) => {
    tokens.push(...tokenizeRule(line, row, isInsideDescription(tokens)));
  });

  return tokens;
};
