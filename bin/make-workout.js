#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const { generateZwo, parse, stats, parseCliOptions } = require("../dist/index");

const opts = parseCliOptions();

const workout = parse(fs.readFileSync(opts.file, "utf8"));

if (opts.stats) {
  console.log(stats(workout));
} else {
  console.log(generateZwo(workout));
}
