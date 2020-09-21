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
      parse(`
Name: My Workout
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

  it("parses basic intervals", () => {
    expect(
      parse(`
Name: My Workout

Rest: 5:00 50%

Interval: 10:00 80% 90rpm

Rest: 5:00 45%
`).intervals
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "cadence": undefined,
          "duration": 300,
          "intensity": Object {
            "from": 0.5,
            "to": 0.5,
          },
          "type": "Rest",
        },
        Object {
          "cadence": 90,
          "duration": 600,
          "intensity": Object {
            "from": 0.8,
            "to": 0.8,
          },
          "type": "Interval",
        },
        Object {
          "cadence": undefined,
          "duration": 300,
          "intensity": Object {
            "from": 0.45,
            "to": 0.45,
          },
          "type": "Rest",
        },
      ]
    `);
  });

  it("parses power-range intervals", () => {
    expect(
      parse(`
Name: My Workout

Warmup: 5:30 50%..80% 100rpm
Cooldown: 5:30 70%..45%
`).intervals
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "cadence": 100,
          "duration": 330,
          "intensity": Object {
            "from": 0.5,
            "to": 0.8,
          },
          "type": "Warmup",
        },
        Object {
          "cadence": undefined,
          "duration": 330,
          "intensity": Object {
            "from": 0.7,
            "to": 0.45,
          },
          "type": "Cooldown",
        },
      ]
    `);
  });

  const parseInterval = (interval: string) =>
    parse(`Name: My Workout\n${interval}`).intervals[0];

  it("parses correct duration formats", () => {
    expect(parseInterval("Interval: 0:10 50%").duration).toEqual(10);
    expect(parseInterval("Interval: 00:10 50%").duration).toEqual(10);
    expect(parseInterval("Interval: 0:00:10 50%").duration).toEqual(10);
    expect(parseInterval("Interval: 0:02:05 50%").duration).toEqual(125);
    expect(parseInterval("Interval: 1:00:00 50%").duration).toEqual(3600);
    expect(parseInterval("Interval: 1:00:0 50%").duration).toEqual(3600);
    expect(parseInterval("Interval: 1:0:0 50%").duration).toEqual(3600);
    expect(parseInterval("Interval: 10:00:00 50%").duration).toEqual(36000);
  });

  it("throws error for incorrect duration formats", () => {
    expect(() =>
      parseInterval("Interval: 10 50%")
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"10\\""`
    );
    expect(() =>
      parseInterval("Interval: :10 50%")
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\":10\\""`
    );
    expect(() =>
      parseInterval("Interval: 0:100 50%")
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"0:100\\""`
    );
    expect(() =>
      parseInterval("Interval: 00:00:00:10 50%")
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"00:00:00:10\\""`
    );
  });
});
