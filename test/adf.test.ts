import { describe, it, expect } from "vitest";
import { toAdf, isAdfDocument, fromAdf, wikiToAdf } from "../src/adf.js";

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

describe("fromAdf", () => {
  it("returns the string unchanged when given a plain string", () => {
    expect(fromAdf("hello")).toBe("hello");
  });

  it("returns empty string for nullish or non-object input", () => {
    expect(fromAdf(null)).toBe("");
    expect(fromAdf(undefined)).toBe("");
    expect(fromAdf(42)).toBe("");
  });

  it("flattens a toAdf round-trip back to text", () => {
    expect(fromAdf(toAdf("hello world")).trim()).toBe("hello world");
  });

  it("joins paragraphs with newlines", () => {
    const doc = {
      type: "doc",
      version: 1,
      content: [
        { type: "paragraph", content: [{ type: "text", text: "first" }] },
        { type: "paragraph", content: [{ type: "text", text: "second" }] },
      ],
    };
    expect(fromAdf(doc).trim()).toBe("first\nsecond");
  });

  it("strips marks (link, bold, color) and keeps only the underlying text", () => {
    const doc = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "see " },
            {
              type: "text",
              text: "Bug threshold calculation",
              marks: [{ type: "link", attrs: { href: "https://example.com" } }],
            },
            { type: "text", text: " for details" },
          ],
        },
      ],
    };
    expect(fromAdf(doc).trim()).toBe("see Bug threshold calculation for details");
  });

  it("walks blockquotes and other nested block nodes (system 'mentioned in MR' shape)", () => {
    const doc = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Tigran" },
            { type: "text", text: " mentioned this issue in " },
            { type: "text", text: "a merge request" },
          ],
        },
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Add Unit Tests for Scale Snap Guard" }],
            },
          ],
        },
      ],
    };
    const out = fromAdf(doc);
    expect(out).toContain("mentioned this issue in");
    expect(out).toContain("Add Unit Tests for Scale Snap Guard");
  });

  it("renders mention nodes using attrs.text when present", () => {
    const doc = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Dear " },
            { type: "mention", attrs: { id: "557058:abc", text: "@nazareth" } },
            { type: "text", text: ", please" },
          ],
        },
      ],
    };
    expect(fromAdf(doc).trim()).toBe("Dear @nazareth, please");
  });

  it("falls back to @<id> when mention has no display text", () => {
    const doc = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "mention", attrs: { id: "557058:abc" } }],
        },
      ],
    };
    expect(fromAdf(doc).trim()).toBe("@557058:abc");
  });

  it("ignores unknown node types but still walks their children", () => {
    const doc = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "customBlock",
          content: [{ type: "text", text: "still extracted" }],
        },
      ],
    };
    expect(fromAdf(doc)).toContain("still extracted");
  });
});

describe("wikiToAdf", () => {
  it("wraps a plain string with no markup as a single-paragraph doc (matches toAdf shape)", () => {
    expect(wikiToAdf("hello world")).toEqual({
      type: "doc",
      version: 1,
      content: [{ type: "paragraph", content: [{ type: "text", text: "hello world" }] }],
    });
  });

  it("splits on \\n into separate paragraphs", () => {
    const doc = wikiToAdf("first\nsecond");
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0]).toEqual({ type: "paragraph", content: [{ type: "text", text: "first" }] });
    expect(doc.content[1]).toEqual({ type: "paragraph", content: [{ type: "text", text: "second" }] });
  });

  it("turns *text* into a strong mark", () => {
    const doc = wikiToAdf("plain *bold* tail");
    expect(doc.content[0]?.content).toEqual([
      { type: "text", text: "plain " },
      { type: "text", text: "bold", marks: [{ type: "strong" }] },
      { type: "text", text: " tail" },
    ]);
  });

  it("leaves a stray * as literal when there is no closing * on the same line", () => {
    const doc = wikiToAdf("a * b\nc");
    expect(doc.content[0]?.content).toEqual([{ type: "text", text: "a * b" }]);
  });

  it("turns [text|url] into a link mark", () => {
    const doc = wikiToAdf("see [the wiki|https://example.com] for more");
    expect(doc.content[0]?.content).toEqual([
      { type: "text", text: "see " },
      { type: "text", text: "the wiki", marks: [{ type: "link", attrs: { href: "https://example.com" } }] },
      { type: "text", text: " for more" },
    ]);
  });

  it("turns {color:red}…{color} into a textColor mark", () => {
    const doc = wikiToAdf("warning {color:red}danger{color} ok");
    expect(doc.content[0]?.content).toEqual([
      { type: "text", text: "warning " },
      { type: "text", text: "danger", marks: [{ type: "textColor", attrs: { color: "#bf2600" } }] },
      { type: "text", text: " ok" },
    ]);
  });

  it("supports color spans that cross newlines (color stays active across paragraphs)", () => {
    const doc = wikiToAdf("Expected: {color:red}\n*42*\n{color}\nAfter");
    // Three paragraphs from the input + the final "After"
    expect(doc.content).toHaveLength(4);
    // Paragraph 2 holds bold "42" with the active color mark
    const p2 = doc.content[1]?.content?.[0];
    expect(p2).toMatchObject({
      type: "text",
      text: "42",
      marks: expect.arrayContaining([
        { type: "textColor", attrs: { color: "#bf2600" } },
        { type: "strong" },
      ]),
    });
    // The trailing "After" is uncolored
    expect(doc.content[3]?.content?.[0]).toEqual({ type: "text", text: "After" });
  });

  it("falls back to a neutral color hex for unknown color names", () => {
    const doc = wikiToAdf("{color:fuchsia}x{color}");
    expect(doc.content[0]?.content?.[0]).toMatchObject({
      marks: [{ type: "textColor", attrs: { color: "#6b778c" } }],
    });
  });

  it("combines bold + link + color marks correctly when nested", () => {
    const doc = wikiToAdf("{color:red}*click [here|https://x]*{color}");
    const nodes = doc.content[0]?.content ?? [];
    // "click " — bold + red
    expect(nodes[0]).toMatchObject({
      text: "click ",
      marks: expect.arrayContaining([{ type: "strong" }, { type: "textColor", attrs: { color: "#bf2600" } }]),
    });
    // "here" — bold + red + link
    expect(nodes[1]).toMatchObject({
      text: "here",
      marks: expect.arrayContaining([
        { type: "strong" },
        { type: "textColor", attrs: { color: "#bf2600" } },
        { type: "link", attrs: { href: "https://x" } },
      ]),
    });
  });

  it("treats unmatched [ as literal text", () => {
    const doc = wikiToAdf("plain [not a link\nnext");
    expect(doc.content[0]?.content).toEqual([{ type: "text", text: "plain [not a link" }]);
  });

  it("preserves the round-trip path: wikiToAdf → fromAdf recovers the visible text (without markers)", () => {
    const adf = wikiToAdf("Hello *world* and [click|https://x]");
    expect(fromAdf(adf).trim()).toBe("Hello world and click");
  });

  it("emits a mention node for [~accountid:UUID] (sibling-level inline node, not a text mark)", () => {
    const doc = wikiToAdf("Dear [~accountid:557058:c60f97e4-aa8f-4b5f-8485-8afe04811602], please");
    expect(doc.content[0]?.content).toEqual([
      { type: "text", text: "Dear " },
      { type: "mention", attrs: { id: "557058:c60f97e4-aa8f-4b5f-8485-8afe04811602" } },
      { type: "text", text: ", please" },
    ]);
  });

  it("[~accountid:...] does not match the [text|url] link path (different prefix)", () => {
    // Sanity: ensure the link parser doesn't accidentally swallow account-id mentions
    const doc = wikiToAdf("[~accountid:abc123]");
    expect(doc.content[0]?.content).toEqual([{ type: "mention", attrs: { id: "abc123" } }]);
  });
});
