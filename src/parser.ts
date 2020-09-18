import { Interval, IntervalData, Workout } from "./ast";
import { isIntervalLabelTokenValue, Token } from "./tokenizer";

type Header = {
  name?: string;
  author?: string;
  description?: string;
};

const extractText = (tokens: Token[]): [string, Token[]] => {
  let text;
  while (tokens[0] && tokens[0].type === "text") {
    if (text === undefined) {
      text = tokens[0].value;
    } else {
      text += "\n" + tokens[0].value;
    }
    tokens.shift();
  }
  return [text ? text.trim() : "", tokens];
};

const parseHeader = (tokens: Token[]): [Header, Token[]] => {
  const header: Header = {};

  while (tokens[0]) {
    const token = tokens[0];
    if (token.type === "label" && token.value === "Name") {
      tokens.shift();
      const [name, rest] = extractText(tokens);
      header.name = name;
      tokens = rest;
    } else if (token.type === "label" && token.value === "Author") {
      tokens.shift();
      const [author, rest] = extractText(tokens);
      header.author = author;
      tokens = rest;
    } else if (token.type === "label" && token.value === "Description") {
      tokens.shift();
      const [description, rest] = extractText(tokens);
      header.description = description;
      tokens = rest;
    } else {
      // End of header
      break;
    }
  }

  return [header, tokens];
};

const parseIntervalParams = (tokens: Token[]): [IntervalData, Token[]] => {
  const data: Partial<IntervalData> = {};

  while (tokens[0]) {
    const token = tokens[0];
    if (token.type === "duration") {
      data.duration = token.value;
      tokens.shift();
    } else if (token.type === "cadence") {
      data.cadence = token.value;
      tokens.shift();
    } else if (token.type === "power") {
      data.power = { from: token.value, to: token.value };
      tokens.shift();
    } else if (token.type === "power-range") {
      data.power = { from: token.value[0], to: token.value[1] };
      tokens.shift();
    } else {
      break;
    }
  }

  if (!("duration" in data)) {
    throw new Error("Duration not specified");
  }
  if (!("power" in data)) {
    throw new Error("Power not specified");
  }

  return [data as IntervalData, tokens];
};

const parseIntervals = (tokens: Token[]): Interval[] => {
  const intervals: Interval[] = [];

  while (tokens[0]) {
    const token = tokens.shift() as Token;
    if (token.type === "label" && isIntervalLabelTokenValue(token.value)) {
      const [{ duration, power, cadence }, rest] = parseIntervalParams(tokens);
      intervals.push({
        type: token.value,
        duration,
        power,
        cadence,
      });
      tokens = rest;
    } else if (token.type === "text" && token.value === "") {
      // Ignore empty lines
    } else {
      throw new Error(`Unexpected token [${token.type} ${token.value}]`);
    }
  }

  return intervals;
};

export const parse = (tokens: Token[]): Workout => {
  const [header, intervalTokens] = parseHeader(tokens);
  return {
    name: header.name || "",
    author: header.author || "",
    description: header.description || "",
    intervals: parseIntervals(intervalTokens),
  };
};
