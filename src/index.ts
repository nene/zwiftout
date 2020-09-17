import * as fs from "fs";

type Def = {
  type: string;
  text: string;
};

const parseDefinition = (line: string): Def | undefined => {
  const matches = line.match(/^(\w+):(.*)$/);
  if (!matches) {
    return undefined;
  }
  return {
    type: matches[1],
    text: matches[2],
  }
};

const isDefined = <T>(x: T | undefined): x is T => Boolean(x);

const filename = process.argv[2];

console.log(`Parsing: ${filename}`);

const file = fs.readFileSync(filename, "utf8");

file.split(/\n/)
  .map(parseDefinition)
  .filter(isDefined)
  .forEach((def) => console.log(def.type));
