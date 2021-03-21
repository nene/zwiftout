import * as fs from "fs";
import { generateZwo } from "../src/generateZwo";
import { parse } from "../src/parser";
import { formatStats, stats } from "../src/stats";

const createStats = (filename: string) => formatStats(stats(parse(fs.readFileSync(filename, "utf8"))));
const createZwo = (filename: string) => generateZwo(parse(fs.readFileSync(filename, "utf8")));

const filenames = [
  "examples/comments.txt",
  "examples/darth-vader.txt",
  "examples/ftp-test.txt",
  "examples/halvfems.txt",
  "examples/threshold-pushing.txt",
  "examples/ramps.txt",
];

describe("Generate ZWO", () => {
  filenames.forEach((filename) => {
    it(filename, () => {
      expect(createZwo(filename)).toMatchSnapshot();
    });
  });
});

describe("Generate stats", () => {
  filenames.forEach((filename) => {
    it(filename, () => {
      expect(createStats(filename)).toMatchSnapshot();
    });
  });
});
