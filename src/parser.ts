import { Interval, Workout } from "./ast";
import { LabelTokenValue, Token } from "./tokenizer";

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
  return [text || "", tokens];
};

const parseHeader = (tokens: Token[]): [Header, Token[]] => {
  const header: Header = {};

  while (tokens[0]) {
    const token = tokens[0];
    if (token.type === "label" && token.value === LabelTokenValue.Name) {
      tokens.shift();
      const [name, rest] = extractText(tokens);
      header.name = name;
      tokens = rest;
    } else if (
      token.type === "label" &&
      token.value === LabelTokenValue.Author
    ) {
      tokens.shift();
      const [author, rest] = extractText(tokens);
      header.author = author;
      tokens = rest;
    } else if (
      token.type === "label" &&
      token.value === LabelTokenValue.Description
    ) {
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

const parseIntervals = (tokens: Token[]): Interval[] => {
  return [];
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
