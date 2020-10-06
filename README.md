# Zwiftout

[Zwift][] workout generator command line tool and library.

Used as engine for the online [workout-editor][].

## Motivation

Creating custom workouts is a pain.

The workout editor in Zwift is pretty clumsy and slow to use:

- drag'n'drop is not the fastest way to edit,
- positioning of messages is especially tricky as they easily jump out of place,
- there's no copy-paste functionality to speed things up.

Editing .zwo files by hand is also inconvenient:

- you'll have to constantly convert minutes to seconds,
- you can easily make errors in XML syntax, rendering the file invalid,
- The syntax is quite inconsistent, making it hard to memoize.

There are a few alternative editors online:

- [ZWOFactory][] is very much point'n'click based which doesn't help much with speeding up the process.
- [Simple ZWO Creator][] is more akin to my liking as it's text-based.
  But it's lacking lots of features: no way to add cadence, text messages, warmup/cooldown etc.
  The syntax used is also kinda confusing.

## Features

- Fully text-based workout creation.
- Easily add cadence targets.
- Easily place text-messages within intervals.
- Support for Warmup/Cooldown & FreeRide interval types.
- Automatic detection of repeated intervals - conversion to `<IntervalsT>` in .zwo file.
- Generation of stats: average and normalized intensity, TSS, zone-distribution.

## Install

```
$ npm install -g zwiftout
```

## Usage

Write a workout description like:

```
Name: Sample workout
Author: John Doe
Tags: Recovery, Intervals, FTP
Description: Try changing it, and see what happens below.

Warmup: 10:00 30%..75%
Interval: 15:00 100% 90rpm
  @ 00:00 Start off easy
  @ 01:00 Settle into rhythm
  @ 07:30 Half way through
  @ 14:00 Final minute, stay strong!
Rest: 10:00 75%
FreeRide: 20:00
  @ 00:10 Just have some fun, riding as you wish
Cooldown: 10:00 70%..30%
```

Feed that file into `zwiftout` program, which spits out Zwift workout XML:

```
$ zwiftout my-workout.txt > my-workout.zwo
```

Also, you can query various stats about the workout:

```
$ zwiftout --stats my-workout.txt

Total duration: 65 minutes

Average intensity: 50%
Normalized intensity: 75%

TSS: 60

Zone Distribution:
 14 min - Z1: Recovery
  6 min - Z2: Endurance
 10 min - Z3: Tempo
 15 min - Z4: Threshold
  0 min - Z5: VO2 Max
  0 min - Z6: Anaerobic
 20 min - Freeride
```

## Usage as library

```js
import { parse, generateZwo, stats } from "zwiftout";

const workout = parse(`
Name: Sample workout
Warmup: 10:00 30%..75%
Interval: 15:00 100% 90rpm
`);

// Output ZWO file
console.log(generateZwo(workout));

// Output various statistics
console.log(stats(workout));
```

## TODO

- Repeats (and nested repeats)
- Unsupported params: message duration & y-position
- More restricted syntax for text (with quotes)

[zwift]: https://zwift.com/
[zwofactory]: https://zwofactory.com/
[simple zwo creator]: https://zwifthacks.com/app/simple-zwo-creator/
[workout-editor]: https://nene.github.io/workout-editor/
