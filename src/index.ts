import * as fs from "fs";
import { parse } from "./parser";
import { tokenizeFile } from "./tokenizer";

const filename = process.argv[2];

console.log(`Parsing: ${filename}`);

const file = fs.readFileSync(filename, "utf8");

const workout = parse(tokenizeFile(file));

console.log(workout);
