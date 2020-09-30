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

  argParser.add_argument("file", { nargs: 1 });

  // As we only allow one file as input,
  // convert filenames array to just a single string.
  const { file, ...rest } = argParser.parse_args();
  return {
    file: file[0],
    ...rest,
  };
};
