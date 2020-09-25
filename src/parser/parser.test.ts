import { parse } from ".";

describe("Parser", () => {
  it("throws error for empty file", () => {
    expect(() => parse("")).toThrowErrorMatchingInlineSnapshot(
      `"Workout is missing a name. Use \`Name:\` to declare one. at line 1 char 1"`,
    );

    expect(() => parse("  \n  \n \t")).toThrowErrorMatchingInlineSnapshot(
      `"Workout is missing a name. Use \`Name:\` to declare one. at line 1 char 1"`,
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
`),
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

  it("throws error for unknown labels", () => {
    expect(() =>
      parse(`
Name: Strange workout
Level: Advanced 
`),
    ).toThrowErrorMatchingInlineSnapshot(`"Unknown label \\"Level:\\" at line 3 char 1"`);
  });

  it("parses basic intervals", () => {
    expect(
      parse(`
Name: My Workout

Rest: 5:00 50%

Interval: 10:00 80% 90rpm

Rest: 5:00 45%
`).intervals,
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "cadence": undefined,
          "comments": Array [],
          "duration": Duration {
            "seconds": 300,
          },
          "intensity": Intensity {
            "_value": 0.5,
          },
          "type": "Rest",
        },
        Object {
          "cadence": 90,
          "comments": Array [],
          "duration": Duration {
            "seconds": 600,
          },
          "intensity": Intensity {
            "_value": 0.8,
          },
          "type": "Interval",
        },
        Object {
          "cadence": undefined,
          "comments": Array [],
          "duration": Duration {
            "seconds": 300,
          },
          "intensity": Intensity {
            "_value": 0.45,
          },
          "type": "Rest",
        },
      ]
    `);
  });

  it("parses intervals after multi-line description", () => {
    expect(
      parse(`
Name: My Workout
Author: John Doe
Description:
  It's a great workout.

  Do it when you dare,
  it'll cause lots of pain.

Interval: 5:00 50%

Interval: 10:00 100%

Interval: 5:00 50%
`),
    ).toMatchInlineSnapshot(`
      Object {
        "author": "John Doe",
        "description": "It's a great workout.

      Do it when you dare,
      it'll cause lots of pain.",
        "intervals": Array [
          Object {
            "cadence": undefined,
            "comments": Array [],
            "duration": Duration {
              "seconds": 300,
            },
            "intensity": Intensity {
              "_value": 0.5,
            },
            "type": "Interval",
          },
          Object {
            "cadence": undefined,
            "comments": Array [],
            "duration": Duration {
              "seconds": 600,
            },
            "intensity": Intensity {
              "_value": 1,
            },
            "type": "Interval",
          },
          Object {
            "cadence": undefined,
            "comments": Array [],
            "duration": Duration {
              "seconds": 300,
            },
            "intensity": Intensity {
              "_value": 0.5,
            },
            "type": "Interval",
          },
        ],
        "name": "My Workout",
      }
    `);
  });

  it("parses power-range intervals", () => {
    expect(
      parse(`
Name: My Workout

Warmup: 5:30 50%..80% 100rpm
Cooldown: 5:30 70%..45%
`).intervals,
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "cadence": 100,
          "comments": Array [],
          "duration": Duration {
            "seconds": 330,
          },
          "intensity": IntensityRange {
            "_end": 0.8,
            "_start": 0.5,
          },
          "type": "Warmup",
        },
        Object {
          "cadence": undefined,
          "comments": Array [],
          "duration": Duration {
            "seconds": 330,
          },
          "intensity": IntensityRange {
            "_end": 0.45,
            "_start": 0.7,
          },
          "type": "Cooldown",
        },
      ]
    `);
  });

  const parseInterval = (interval: string) => parse(`Name: My Workout\n${interval}`).intervals[0];

  it("requires duration and power parameters to be specified", () => {
    expect(() => parseInterval("Interval: 50%")).toThrowErrorMatchingInlineSnapshot(
      `"Duration not specified at line 2 char 1"`,
    );
    expect(() => parseInterval("Interval: 30:00")).toThrowErrorMatchingInlineSnapshot(
      `"Power not specified at line 2 char 1"`,
    );
    expect(() => parseInterval("Interval: 10rpm")).toThrowErrorMatchingInlineSnapshot(
      `"Duration not specified at line 2 char 1"`,
    );
  });

  it("allows any order for interval parameters", () => {
    expect(parseInterval("Interval: 50% 00:10")).toMatchInlineSnapshot(`
      Object {
        "cadence": undefined,
        "comments": Array [],
        "duration": Duration {
          "seconds": 10,
        },
        "intensity": Intensity {
          "_value": 0.5,
        },
        "type": "Interval",
      }
    `);
    expect(parseInterval("Interval: 50% 100rpm 00:10")).toMatchInlineSnapshot(`
      Object {
        "cadence": 100,
        "comments": Array [],
        "duration": Duration {
          "seconds": 10,
        },
        "intensity": Intensity {
          "_value": 0.5,
        },
        "type": "Interval",
      }
    `);
    expect(parseInterval("Interval: 100rpm 00:10 50%")).toMatchInlineSnapshot(`
      Object {
        "cadence": 100,
        "comments": Array [],
        "duration": Duration {
          "seconds": 10,
        },
        "intensity": Intensity {
          "_value": 0.5,
        },
        "type": "Interval",
      }
    `);
  });

  it("allows whitespace between interval parameters", () => {
    expect(parseInterval("Interval:  50%  00:10  100rpm")).toMatchInlineSnapshot(`
      Object {
        "cadence": 100,
        "comments": Array [],
        "duration": Duration {
          "seconds": 10,
        },
        "intensity": Intensity {
          "_value": 0.5,
        },
        "type": "Interval",
      }
    `);
    expect(parseInterval("Interval: \t 50% \t 00:10 \t\t 100rpm \t")).toMatchInlineSnapshot(`
      Object {
        "cadence": 100,
        "comments": Array [],
        "duration": Duration {
          "seconds": 10,
        },
        "intensity": Intensity {
          "_value": 0.5,
        },
        "type": "Interval",
      }
    `);
  });

  it("parses correct duration formats", () => {
    expect(parseInterval("Interval: 0:10 50%").duration.seconds).toEqual(10);
    expect(parseInterval("Interval: 00:10 50%").duration.seconds).toEqual(10);
    expect(parseInterval("Interval: 0:00:10 50%").duration.seconds).toEqual(10);
    expect(parseInterval("Interval: 0:02:05 50%").duration.seconds).toEqual(125);
    expect(parseInterval("Interval: 1:00:00 50%").duration.seconds).toEqual(3600);
    expect(parseInterval("Interval: 1:00:0 50%").duration.seconds).toEqual(3600);
    expect(parseInterval("Interval: 1:0:0 50%").duration.seconds).toEqual(3600);
    expect(parseInterval("Interval: 10:00:00 50%").duration.seconds).toEqual(36000);
  });

  it("throws error for incorrect duration formats", () => {
    expect(() => parseInterval("Interval: 10 50%")).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"10\\" at line 2 char 11"`,
    );
    expect(() => parseInterval("Interval: :10 50%")).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\":10\\" at line 2 char 11"`,
    );
    expect(() => parseInterval("Interval: 0:100 50%")).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"0:100\\" at line 2 char 11"`,
    );
    expect(() => parseInterval("Interval: 00:00:00:10 50%")).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"00:00:00:10\\" at line 2 char 11"`,
    );
  });

  it("throws error for unexpected interval parameter", () => {
    expect(() => parseInterval("Interval: 10:00 50% foobar")).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"foobar\\" at line 2 char 21"`,
    );
    expect(() => parseInterval("Interval: 10:00 50% 123blah")).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"123blah\\" at line 2 char 21"`,
    );
    expect(() => parseInterval("Interval: 10:00 50% ^*&")).toThrowErrorMatchingInlineSnapshot(
      `"Unrecognized interval parameter \\"^*&\\" at line 2 char 21"`,
    );
  });

  it("throws error for unexpected type of interval", () => {
    expect(() => parseInterval("Interval: 30:00 5% \n CustomInterval: 15:00 10%")).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected token [text CustomInterval: 15:00 10%] at line 3 char 1"`,
    );
  });

  it("parses intervals with comments", () => {
    expect(
      parse(`
Name: My Workout
Interval: 10:00 90%
  # 0:00 Find your rythm.
  # 1:00 Try to settle in for the effort

  # 5:00 Half way through

  # 9:00 Almost there
  # 9:30 Final push. YOU GOT IT!

Rest: 5:00 50%
  # 0:00 Great effort!
  # 0:30 Cool down well after all of this.
`),
    ).toMatchInlineSnapshot(`
      Object {
        "author": "",
        "description": "",
        "intervals": Array [
          Object {
            "cadence": undefined,
            "comments": Array [
              Object {
                "offset": Duration {
                  "seconds": 0,
                },
                "text": "Find your rythm.",
              },
              Object {
                "offset": Duration {
                  "seconds": 60,
                },
                "text": "Try to settle in for the effort",
              },
              Object {
                "offset": Duration {
                  "seconds": 300,
                },
                "text": "Half way through",
              },
              Object {
                "offset": Duration {
                  "seconds": 540,
                },
                "text": "Almost there",
              },
              Object {
                "offset": Duration {
                  "seconds": 570,
                },
                "text": "Final push. YOU GOT IT!",
              },
            ],
            "duration": Duration {
              "seconds": 600,
            },
            "intensity": Intensity {
              "_value": 0.9,
            },
            "type": "Interval",
          },
          Object {
            "cadence": undefined,
            "comments": Array [
              Object {
                "offset": Duration {
                  "seconds": 0,
                },
                "text": "Great effort!",
              },
              Object {
                "offset": Duration {
                  "seconds": 30,
                },
                "text": "Cool down well after all of this.",
              },
            ],
            "duration": Duration {
              "seconds": 300,
            },
            "intensity": Intensity {
              "_value": 0.5,
            },
            "type": "Rest",
          },
        ],
        "name": "My Workout",
      }
    `);
  });
});
