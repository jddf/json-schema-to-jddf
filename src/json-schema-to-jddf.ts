import * as yargs from "yargs";
import * as fs from "fs";
import toJDDF from ".";

function main({ INPUT }: { INPUT: string }) {
  const input = INPUT === "-" ? 0 : INPUT;
  const schema = JSON.parse(fs.readFileSync(input, "utf8"));
  console.log(JSON.stringify(toJDDF(schema)));
}

yargs
  .scriptName("json-schema-to-jddf")
  .usage("$0 [INPUT]")
  .command(
    "$0 [INPUT]",
    "Convert a JSON Schema schema to JSON Data Defition Format",
    yargs =>
      yargs.positional("INPUT", {
        type: "string",
        default: "-",
        describe: `Where to read a JSON Schema schema from. Hyphen ("-") indicates STDIN`,
      }),
    argv => {
      main(argv);
    },
  )
  .help().argv;
