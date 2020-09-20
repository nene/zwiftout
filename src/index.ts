import * as fs from "fs";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";
import { tss } from "./tss";

const filename = process.argv[2];

console.log(`Parsing: ${filename}`);

const file = fs.readFileSync(filename, "utf8");

const workout = parse(tokenize(file));

console.log(workout.intervals);

workout.intervals.forEach((interval, i) => {
  console.log(`#${i} TSS: ${tss([interval])}`);
});

console.log("Total TSS: " + tss(workout.intervals));

const duration =
  workout.intervals.map(({ duration }) => duration).reduce((a, b) => a + b, 0) /
  60;
console.log(`Total duration: ${duration} minutes`);
