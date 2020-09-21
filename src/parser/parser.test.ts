import { parse } from ".";

describe("Parser", () => {
  it("parses empty workout file", () => {
    expect(parse("")).toMatchInlineSnapshot(`
      Object {
        "author": "",
        "description": "",
        "intervals": Array [],
        "name": "",
      }
    `);
  });
});
