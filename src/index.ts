import { Schema } from "@jddf/jddf";

/**
 * Convert a JSON Schema schema into a JSON Data Definition schema.
 *
 * Please consult the README of this package for caveats about this function. In
 * particular, note that not all variations of JSON Schema are accepted, and the
 * default behavior when handling unsupported JSON Schema features is to return
 * a JDDF schema which accepts anything.
 *
 * @param schema a JSON Schema schema
 */
export default function toJDDF(schema: any): Schema {
  if (typeof schema !== "object") {
    return {};
  }

  if (typeof schema.type === "string") {
    switch (schema.type) {
      case "boolean":
        return { type: "boolean" };
      case "number":
        return { type: "float64" };
      case "string":
        return { type: "string" };
      case "array":
        return { elements: toJDDF(schema.items) };
      case "object":
        if (typeof schema.properties === "object") {
          const required: { [name: string]: Schema } = {};
          const optional: { [name: string]: Schema } = {};

          for (const [property, subSchema] of Object.entries(
            schema.properties,
          )) {
            if (
              Array.isArray(schema.required) &&
              schema.required.includes(property)
            ) {
              required[property] = toJDDF(subSchema);
            } else {
              optional[property] = toJDDF(subSchema);
            }
          }

          // Additional properties are always allowed, unless its value is
          // explicitly "false" in the JSON Schema.
          const additional = schema.additionalProperties !== false;

          // To make output more pleasant, omit properties, optionalProperties,
          // or additionalProperties if their values are already the default
          // one.
          const properties =
            Object.entries(required).length === 0
              ? {}
              : { properties: required };

          const optionalProperties =
            Object.entries(optional).length === 0
              ? {}
              : { optionalProperties: optional };

          const additionalProperties = additional
            ? { additionalProperties: true }
            : {};

          return {
            ...properties,
            ...optionalProperties,
            ...additionalProperties,
          };
        }

        if (typeof schema.additionalProperties === "object") {
          return { values: toJDDF(schema.additionalProperties) };
        }
    }
  }

  return {};
}
