import * as fs from "fs";
import { averageIntensity } from "./averageIntensity";
import { normalizedIntensity } from "./normalizedIntensity";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";
import { totalDuration } from "./totalDuration";
import { tss } from "./tss";
import { tss2 } from "./tss2";

const filename = process.argv[2];

console.log(`Parsing: ${filename}`);

const file = fs.readFileSync(filename, "utf8");

const workout = parse(tokenize(file));

console.log(workout.intervals);

console.log();
console.log("Total TSS: " + tss(workout.intervals).toFixed());

console.log();
console.log(
  `Total duration: ${(totalDuration(workout.intervals) / 60).toFixed()} minutes`
);

console.log();
console.log(
  `Average intensity: ${(averageIntensity(workout.intervals) * 100).toFixed()}%`
);
console.log(
  `Normalized intensity: ${(
    normalizedIntensity(workout.intervals) * 100
  ).toFixed()}%`
);

console.log(
  `TSS: ${tss2(
    totalDuration(workout.intervals),
    normalizedIntensity(workout.intervals)
  )}`
);
