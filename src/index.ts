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

const { intervals } = parse(tokenize(file));

const duration = totalDuration(intervals);
const avgIntensity = averageIntensity(intervals);
const normIntensity = normalizedIntensity(intervals);

console.log(intervals);

console.log(`
Total duration: ${(duration / 60).toFixed()} minutes

Average intensity: ${(avgIntensity * 100).toFixed()}%
Normalized intensity: ${(normIntensity * 100).toFixed()}%

TSS #1: ${tss(intervals).toFixed()}
TSS #2: ${tss2(duration, normIntensity).toFixed()}
`);
