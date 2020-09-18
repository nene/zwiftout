import * as fs from "fs";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";

const filename = process.argv[2];

console.log(`Parsing: ${filename}`);

const file = fs.readFileSync(filename, "utf8");

const workout = parse(tokenize(file));

console.log(workout);
