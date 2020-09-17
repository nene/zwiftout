import * as fs from "fs";
import { parseFile } from "./parser";

const filename = process.argv[2];

console.log(`Parsing: ${filename}`);

const file = fs.readFileSync(filename, "utf8");

parseFile(file).forEach((rule) => {
  console.log(rule.type);
  rule.params.forEach((p) => {
    console.log(`  ${p.type}: ${p.value}`);
  });
});
