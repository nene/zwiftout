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

  it("parses workout with just Name field", () => {
    expect(parse(`Name: My Workout`)).toMatchInlineSnapshot(`
      Object {
        "author": "",
        "description": "",
        "intervals": Array [],
        "name": "My Workout",
      }
    `);
  });

  it("parses workout header with all fields", () => {
    expect(
      parse(`Name: My Workout
Author: John Doe
Description:
  It's a great workout.
  
  Do it when you dare,
  it'll cause lots of pain.
`)
    ).toMatchInlineSnapshot(`
      Object {
        "author": "John Doe",
        "description": "It's a great workout.

      Do it when you dare,
      it'll cause lots of pain.",
        "intervals": Array [],
        "name": "My Workout",
      }
    `);
  });
});
