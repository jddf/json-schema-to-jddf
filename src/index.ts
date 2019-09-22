import { Schema } from "@jddf/jddf";

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
