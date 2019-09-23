# json-schema-to-jddf [![npm](https://img.shields.io/npm/v/@jddf/json-schema-to-jddf.svg)](https://www.npmjs.com/package/@jddf/json-schema-to-jddf)

This repository contains `json-schema-to-jddf`, which comes in two forms:

- `json-schema-to-jddf`, a CLI tool which converts JSON Schema into JSON Data
  Definition Format.

- `@jddf/json-schema-to-jddf`, a JavaScript package which takes in
  already-parsed JSON Schema objects, and converts them into JSON Data
  Definition Format objects. Internally, the `json-schema-to-jddf` CLI tool uses
  this package.

## Example Usage (CLI)

Let's say you have a JSON Schema like the one below in a file called
`example.json`:

```json
{
  "type": "object",
  "properties": {
    "is_admin": { "type": "boolean" },
    "name": { "type": "string" },
    "favorite_numbers": {
      "type": "array",
      "items": {
        "type": "number"
      }
    }
  },
  "required": ["is_admin", "name"]
}
```

You can convert that into a JDDF schema with the following command:

```bash
json-schema-to-jddf example.json
```

This outputs the following JSON:

```json
{
  "properties": {
    "is_admin": {
      "type": "boolean"
    },
    "name": {
      "type": "string"
    }
  },
  "optionalProperties": {
    "favorite_numbers": {
      "elements": {
        "type": "float64"
      }
    }
  },
  "additionalProperties": true
}
```

For more help using the `json-schema-to-jddf` tool, run:

```bash
json-schema-to-jddf --help
```

In particular, note that if you run `json-schema-to-jddf` without arguments, it
will attempt to read a JSON Schema from standard input. That's why the program
appears to "hang" if you run it without arguments.

## Example Usage (JavaScript)

The equivalent use of this package from JavaScript / TypeScript looks like this:

```ts
import { toJDDF } from "@jddf/json-schema-to-jddf";

const jsonSchema = {
  type: "object",
  properties: {
    is_admin: { type: "boolean" },
    name: { type: "string" },
    favorite_numbers: {
      type: "array",
      items: {
        type: "number"
      }
    }
  },
  required: ["is_admin", "name"]
}

// This outputs essentially the same thing as the CLI example above.
console.log(toJDDF(jsonSchema))
```

## Caveats

There are a few challenges in writing a tool like `json-schema-to-jddf`:

- There are many different ways for JSON Schemas to express the same thing. This
  makes it difficult, for instance, to detect the different ways you could
  express "a map from strings to booleans" in JSON Schema.

  This tool attempts to detect the most common ways of doing things in JSON
  Schema. For example, "a map from strings to booleans", which in JDDF can be
  expressed only using:

  ```json
  { "values": { "type": "boolean" }}
  ```

  Is expected in JSON Schema to look like:

  ```json
  {
    "type": "object",
    "additionalProperties": {
      "type": "boolean"
    }
  }
  ```

- JSON Schema is capable of expressing more complex sorts of data formats than
  JDDF (this is by design -- JDDF lies on the simpler end of the "simplicity vs
  expressiveness" continuum). Therefore, converting from JSON Schema to JDDF is
  necessarily a lossy process.

  Where there is no JDDF capable of expressing the constraints in a particular
  JSON Schema, this tool outputs an empty JDDF schema (`{}`). An empty JDDF
  schema will accept anything.

  This caveat is especially important if you have schemas like this one:

  ```json
  {
    "items": { "type": "string" }
  }
  ```

  It may seem as though that schema would accept only arrays of strings. But in
  fact, it would also accept any non-array JSON value, since there is no
  `"type": "array"`. The `json-schema-to-jddf` tool will convert the above JSON
  Schema to `{}`, as JDDF cannot express "accept anything that's not an array,
  and if it's array then all of the elements of that array must be strings".

  If you add `"type": "array"` to the above JSON Schema, then the tool will
  output the following JDDF schema:

  ```json
  { "elements": { "type": "string" }}
  ```

If you encouter a JSON Schema which you feel ought to be supported by this tool,
please open a GitHub ticket! Your suggestion will be warmly welcomed, and we'll
try to find a way to support your use-case.
