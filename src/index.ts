import * as fs from "fs";
import { tokenizeFile } from "./tokenizer";

const filename = process.argv[2];

console.log(`Parsing: ${filename}`);

const file = fs.readFileSync(filename, "utf8");

tokenizeFile(file).forEach((token) => {
  console.log(token.type, token.value);
});
