import { describe, it, expect } from "vitest";
import { toAdf, isAdfDocument } from "../src/adf.js";

describe("adf", () => {
  it("wraps a plain string as an ADF doc", () => {
    expect(toAdf("hello world")).toEqual({
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "hello world" }],
        },
      ],
    });
  });

  it("round-trips through isAdfDocument", () => {
    expect(isAdfDocument(toAdf("hi"))).toBe(true);
  });

  it("rejects non-ADF values", () => {
    expect(isAdfDocument("plain string")).toBe(false);
    expect(isAdfDocument(null)).toBe(false);
    expect(isAdfDocument({ type: "doc" })).toBe(false);
    expect(isAdfDocument({ type: "paragraph", content: [] })).toBe(false);
  });
});
