import { parse } from ".";

describe("Parser", () => {
  it("creates Untitled workout from empty file", () => {
    expect(parse("")).toMatchInlineSnapshot(`
      Object {
        "author": "",
        "description": "",
        "intervals": Array [],
        "name": "Untitled",
        "tags": Array [],
      }
    `);

    expect(parse("  \n  \n \t")).toMatchInlineSnapshot(`
      Object {
        "author": "",
        "description": "",
        "intervals": Array [],
        "name": "Untitled",
        "tags": Array [],
      }
    `);
  });

  it("parses workout with just Name field", () => {
    expect(parse(`Name: My Workout`)).toMatchInlineSnapshot(`
      Object {
        "author": "",
        "description": "",
        "intervals": Array [],
        "name": "My Workout",
        "tags": Array [],
      }
    `);
  });

  it("parses workout header with name, author, description", () => {
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
        "tags": Array [],
      }
    `);
  });

  it("parses workout header with comma-separated tags", () => {
    expect(
      parse(`
Name: My Workout
Tags: Recovery, Intervals , FTP
`),
    ).toMatchInlineSnapshot(`
      Object {
        "author": "",
        "description": "",
        "intervals": Array [],
        "name": "My Workout",
        "tags": Array [
          "Recovery",
          "Intervals",
          "FTP",
        ],
      }
    `);
  });

  it("treats with space-separated tags as single tag", () => {
    expect(
      parse(`
Name: My Workout
Tags: Recovery Intervals FTP
`),
    ).toMatchInlineSnapshot(`
      Object {
        "author": "",
        "description": "",
        "intervals": Array [],
        "name": "My Workout",
        "tags": Array [
          "Recovery Intervals FTP",
        ],
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
          "intensity": ConstantIntensity {
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
          "intensity": ConstantIntensity {
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
          "intensity": ConstantIntensity {
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
            "intensity": ConstantIntensity {
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
            "intensity": ConstantIntensity {
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
            "intensity": ConstantIntensity {
              "_value": 0.5,
            },
            "type": "Interval",
          },
        ],
        "name": "My Workout",
        "tags": Array [],
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
          "intensity": RangeIntensity {
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
          "intensity": RangeIntensity {
            "_end": 0.45,
            "_start": 0.7,
          },
          "type": "Cooldown",
        },
      ]
    `);
  });

  it("parses free-ride intervals", () => {
    expect(
      parse(`
Name: My Workout

FreeRide: 5:00
`).intervals,
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "cadence": undefined,
          "comments": Array [],
          "duration": Duration {
            "seconds": 300,
          },
          "intensity": FreeIntensity {},
          "type": "FreeRide",
        },
      ]
    `);
  });

  it("Treats any interval without intensity as a free-ride interval", () => {
    expect(
      parse(`
Name: My Workout

Interval: 5:00
`).intervals,
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "cadence": undefined,
          "comments": Array [],
          "duration": Duration {
            "seconds": 300,
          },
          "intensity": FreeIntensity {},
          "type": "Interval",
        },
      ]
    `);
  });

  const parseInterval = (interval: string) => parse(`Name: My Workout\n${interval}`).intervals[0];

  it("requires duration parameter to be specified", () => {
    expect(() => parseInterval("Interval: 50%")).toThrowErrorMatchingInlineSnapshot(
      `"Duration not specified at line 2 char 1"`,
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
        "intensity": ConstantIntensity {
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
        "intensity": ConstantIntensity {
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
        "intensity": ConstantIntensity {
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
        "intensity": ConstantIntensity {
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
        "intensity": ConstantIntensity {
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
  @ 0:00 Find your rythm.
  @ 1:00 Try to settle in for the effort

  @ 5:00 Half way through

  @ 9:00 Almost there
  @ 9:30 Final push. YOU GOT IT!

Rest: 5:00 50%
  @ 0:00 Great effort!
  @ 0:30 Cool down well after all of this.
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
                "loc": Object {
                  "col": 4,
                  "row": 3,
                },
                "offset": Duration {
                  "seconds": 0,
                },
                "text": "Find your rythm.",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 4,
                },
                "offset": Duration {
                  "seconds": 60,
                },
                "text": "Try to settle in for the effort",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 6,
                },
                "offset": Duration {
                  "seconds": 300,
                },
                "text": "Half way through",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 8,
                },
                "offset": Duration {
                  "seconds": 540,
                },
                "text": "Almost there",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 9,
                },
                "offset": Duration {
                  "seconds": 570,
                },
                "text": "Final push. YOU GOT IT!",
              },
            ],
            "duration": Duration {
              "seconds": 600,
            },
            "intensity": ConstantIntensity {
              "_value": 0.9,
            },
            "type": "Interval",
          },
          Object {
            "cadence": undefined,
            "comments": Array [
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 12,
                },
                "offset": Duration {
                  "seconds": 0,
                },
                "text": "Great effort!",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 13,
                },
                "offset": Duration {
                  "seconds": 30,
                },
                "text": "Cool down well after all of this.",
              },
            ],
            "duration": Duration {
              "seconds": 300,
            },
            "intensity": ConstantIntensity {
              "_value": 0.5,
            },
            "type": "Rest",
          },
        ],
        "name": "My Workout",
        "tags": Array [],
      }
    `);
  });

  it("parses intervals with negative comment offsets", () => {
    expect(
      parse(`
Name: My Workout
Interval: 10:00 90%
  @ 0:10 Find your rythm.
  @ -0:10 Final push. YOU GOT IT!

Rest: 5:00 50%
  @ -4:30 Great effort!
  @ -2:00 Cool down well after all of this.
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
                "loc": Object {
                  "col": 4,
                  "row": 3,
                },
                "offset": Duration {
                  "seconds": 10,
                },
                "text": "Find your rythm.",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 4,
                },
                "offset": Duration {
                  "seconds": 590,
                },
                "text": "Final push. YOU GOT IT!",
              },
            ],
            "duration": Duration {
              "seconds": 600,
            },
            "intensity": ConstantIntensity {
              "_value": 0.9,
            },
            "type": "Interval",
          },
          Object {
            "cadence": undefined,
            "comments": Array [
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 7,
                },
                "offset": Duration {
                  "seconds": 30,
                },
                "text": "Great effort!",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 8,
                },
                "offset": Duration {
                  "seconds": 180,
                },
                "text": "Cool down well after all of this.",
              },
            ],
            "duration": Duration {
              "seconds": 300,
            },
            "intensity": ConstantIntensity {
              "_value": 0.5,
            },
            "type": "Rest",
          },
        ],
        "name": "My Workout",
        "tags": Array [],
      }
    `);
  });

  it("parses intervals with positive comment offsets", () => {
    expect(
      parse(`
Name: My Workout
Interval: 10:00 90%
  @ 0:50 First comment
  @ +0:10 Comment #2 10 seconds later
  @ +0:10 Comment #3 another 10 seconds later
  @ 5:00 Half way!
  @ +0:10 Comment #5 10 seconds later
  @ +0:10 Comment #6 another 10 seconds later
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
                "loc": Object {
                  "col": 4,
                  "row": 3,
                },
                "offset": Duration {
                  "seconds": 50,
                },
                "text": "First comment",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 4,
                },
                "offset": Duration {
                  "seconds": 60,
                },
                "text": "Comment #2 10 seconds later",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 5,
                },
                "offset": Duration {
                  "seconds": 70,
                },
                "text": "Comment #3 another 10 seconds later",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 6,
                },
                "offset": Duration {
                  "seconds": 300,
                },
                "text": "Half way!",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 7,
                },
                "offset": Duration {
                  "seconds": 310,
                },
                "text": "Comment #5 10 seconds later",
              },
              Object {
                "loc": Object {
                  "col": 4,
                  "row": 8,
                },
                "offset": Duration {
                  "seconds": 320,
                },
                "text": "Comment #6 another 10 seconds later",
              },
            ],
            "duration": Duration {
              "seconds": 600,
            },
            "intensity": ConstantIntensity {
              "_value": 0.9,
            },
            "type": "Interval",
          },
        ],
        "name": "My Workout",
        "tags": Array [],
      }
    `);
  });

  it("treats positive comment offset as relative to interval start when there's no previous comment", () => {
    expect(
      parse(`
Name: My Workout
Interval: 10:00 90%
  @ +1:00 First comment
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
                "loc": Object {
                  "col": 4,
                  "row": 3,
                },
                "offset": Duration {
                  "seconds": 60,
                },
                "text": "First comment",
              },
            ],
            "duration": Duration {
              "seconds": 600,
            },
            "intensity": ConstantIntensity {
              "_value": 0.9,
            },
            "type": "Interval",
          },
        ],
        "name": "My Workout",
        "tags": Array [],
      }
    `);
  });

  it("throws error when comment offset is outside of interval length", () => {
    expect(() =>
      parse(`
Name: My Workout
Interval: 2:00 90%
  @ 0:00 Find your rythm.
  @ 3:10 Try to settle in for the effort
`),
    ).toThrowErrorMatchingInlineSnapshot(`"Comment offset is larger than interval length at line 5 char 5"`);
  });

  it("throws error when negative comment offset is outside of interval", () => {
    expect(() =>
      parse(`
Name: My Workout
Interval: 2:00 90%
  @ 0:00 Find your rythm.
  @ -3:10 Try to settle in for the effort
`),
    ).toThrowErrorMatchingInlineSnapshot(`"Negative comment offset is larger than interval length at line 5 char 5"`);
  });

  it("throws error when comment offset is the same as another comment offset", () => {
    expect(() =>
      parse(`
Name: My Workout
Interval: 2:00 90%
  @ 0:00 First comment
  @ 1:00 Comment
  @ 1:00 Overlapping comment
  @ 1:50 Last comment
`),
    ).toThrowErrorMatchingInlineSnapshot(`"Comment overlaps previous comment at line 6 char 5"`);
  });

  it("throws error when comment offset is greater than next comment offset", () => {
    expect(() =>
      parse(`
Name: My Workout
Interval: 2:00 90%
  @ 0:00 First comment
  @ 1:20 Comment
  @ 1:00 Misplaced comment
  @ 1:50 Last comment
`),
    ).toThrowErrorMatchingInlineSnapshot(`"Comment overlaps previous comment at line 6 char 5"`);
  });

  it("throws error when comments too close together", () => {
    expect(() =>
      parse(`
Name: My Workout
Interval: 2:00 90%
  @ 0:00 First comment
  @ 0:01 Second Comment
`),
    ).toThrowErrorMatchingInlineSnapshot(`"Less than 10 seconds between comments at line 5 char 5"`);

    expect(() =>
      parse(`
Name: My Workout
Interval: 2:00 90%
  @ 0:00 First comment
  @ 0:09 Second Comment
`),
    ).toThrowErrorMatchingInlineSnapshot(`"Less than 10 seconds between comments at line 5 char 5"`);
  });

  it("triggers no error when comments at least 10 seconds apart", () => {
    expect(() =>
      parse(`
Name: My Workout
Interval: 2:00 90%
  @ 0:00 First comment
  @ 0:10 Second Comment
`),
    ).not.toThrowError();
  });

  it("throws error when comment does not finish before end of interval", () => {
    expect(() =>
      parse(`
Name: My Workout
Interval: 1:00 80%
  @ 0:51 First comment
Interval: 1:00 90%
`),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Less than 10 seconds between comment start and interval end at line 4 char 5"`,
    );
  });

  it("triggers no error when comment finishes right at interval end", () => {
    expect(() =>
      parse(`
Name: My Workout
Interval: 1:00 80%
  @ 0:50 First comment
Interval: 1:00 90%
`),
    ).not.toThrowError();
  });
});
