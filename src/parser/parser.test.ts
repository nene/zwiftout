import { parse } from ".";

describe("Parser", () => {
  it("throws error for empty file", () => {
    expect(() => parse("")).toThrowErrorMatchingInlineSnapshot(
      `"Workout is missing a name. Use \`Name:\` to declare one."`
    );

    expect(() => parse("  \n  \n \t")).toThrowErrorMatchingInlineSnapshot(
      `"Workout is missing a name. Use \`Name:\` to declare one."`
    );
  });
});
