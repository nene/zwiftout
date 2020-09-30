import * as fs from "fs";
import { generateZwo } from "./generateZwo";
import { parse } from "./parser";
import { stats } from "./stats";
import { parseCliOptions } from "./parseCliOptions";

const opts = parseCliOptions();

const workout = parse(fs.readFileSync(opts.file, "utf8"));

if (opts.stats) {
  console.log(stats(workout));
} else {
  console.log(generateZwo(workout));
}
