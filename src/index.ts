import * as fs from "fs";
import { generateZwo } from "./generateZwo";
import { parse } from "./parser";
import { stats } from "./stats";

const opts = { stats: false, filename: "" };
if (process.argv[2] === "--stats") {
  opts.stats = true;
  opts.filename = process.argv[3];
} else {
  opts.filename = process.argv[2];
}

const workout = parse(fs.readFileSync(opts.filename, "utf8"));

if (opts.stats) {
  console.log(stats(workout));
} else {
  console.log(generateZwo(workout));
}
