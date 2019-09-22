import toJDDF from ".";

describe("toJDDF", () => {
  it("converts empty schema", () => {
    expect(toJDDF({})).toEqual({});
  });

  it("converts boolean schema", () => {
    expect(toJDDF({ type: "boolean" })).toEqual({ type: "boolean" });
  });

  it("converts number schema", () => {
    expect(toJDDF({ type: "number" })).toEqual({ type: "float64" });
  });

  it("converts string schema", () => {
    expect(toJDDF({ type: "string" })).toEqual({ type: "string" });
  });

  it("converts array schema with items", () => {
    expect(toJDDF({ type: "array", items: { type: "string" } })).toEqual({
      elements: {
        type: "string",
      },
    });
  });

  it("converts object schema with required properties", () => {
    expect(
      toJDDF({
        type: "object",
        properties: { foo: { type: "string" }, bar: { type: "string" } },
        required: ["foo", "bar"],
      }),
    ).toEqual({
      properties: {
        foo: { type: "string" },
        bar: { type: "string" },
      },
      additionalProperties: true,
    });
  });

  it("converts object schema with optional properties", () => {
    expect(
      toJDDF({
        type: "object",
        properties: { foo: { type: "string" }, bar: { type: "string" } },
      }),
    ).toEqual({
      optionalProperties: {
        foo: { type: "string" },
        bar: { type: "string" },
      },
      additionalProperties: true,
    });
  });

  it("converts object schema with mixed required and optional properties", () => {
    expect(
      toJDDF({
        type: "object",
        properties: { foo: { type: "string" }, bar: { type: "string" } },
        required: ["foo"],
      }),
    ).toEqual({
      properties: {
        foo: { type: "string" },
      },
      optionalProperties: {
        bar: { type: "string" },
      },
      additionalProperties: true,
    });
  });

  it("converts object schema with properties and disallowed additional properties", () => {
    expect(
      toJDDF({
        type: "object",
        properties: { foo: { type: "string" }, bar: { type: "string" } },
        required: ["foo"],
        additionalProperties: false,
      }),
    ).toEqual({
      properties: {
        foo: { type: "string" },
      },
      optionalProperties: {
        bar: { type: "string" },
      },
    });
  });

  it("converts object schema with additionalProperties but no properties", () => {
    expect(
      toJDDF({
        type: "object",
        additionalProperties: { type: "string" },
      }),
    ).toEqual({
      values: {
        type: "string",
      },
    });
  });
});
