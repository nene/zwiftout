import * as fs from "fs";
import { parseRule } from "./parser";

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
