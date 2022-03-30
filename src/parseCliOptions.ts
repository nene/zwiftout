import { ArgumentParser } from "argparse";

export type CliOptions = {
  file: string;
  stats: boolean;
};

export const parseCliOptions = (): CliOptions => {
  const argParser = new ArgumentParser({
    description: "Zwift workout generator",
    add_help: true,
  });

  argParser.add_argument("--stats", {
    help: "output aggregate statistics instead of ZWO file",
    action: "store_true",
    default: false,
  });

  argParser.add_argument("file", {
    nargs: "?",
    default: 0, // Default to reading STDIN
  });

  return argParser.parse_args();
};
