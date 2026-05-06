import type { AdfDocument } from "./types.js";

export function toAdf(text: string): AdfDocument {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

export function isAdfDocument(value: unknown): value is AdfDocument {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "doc" &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

/**
 * Flatten an ADF document (or any ADF subtree) to plain text by walking the content tree
 * and concatenating `text` nodes. Block-level nodes (paragraph, heading, blockquote, list
 * items, etc.) are separated by newlines so structure is preserved at line granularity.
 *
 * Use this when you need to substring-match against a comment body that round-tripped
 * through ADF. Marks (bold, link, color, etc.) are stripped — only the underlying text
 * is returned.
 */
export function fromAdf(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const node = value as { type?: string; text?: string; content?: unknown[]; attrs?: Record<string, unknown> };
  if (node.type === "text" && typeof node.text === "string") return node.text;
  if (node.type === "mention") {
    // Prefer the cached display text Jira embeds; fall back to the account id so dedup
    // and substring checks have something stable to match against.
    const text = node.attrs?.text;
    const id = node.attrs?.id;
    if (typeof text === "string" && text.length > 0) return text;
    if (typeof id === "string") return `@${id}`;
    return "";
  }

  const children = Array.isArray(node.content) ? node.content.map(fromAdf) : [];
  // Block-level nodes get a trailing newline so adjacent paragraphs / list items stay separate.
  const isBlock =
    node.type === "doc" ||
    node.type === "paragraph" ||
    node.type === "heading" ||
    node.type === "blockquote" ||
    node.type === "bulletList" ||
    node.type === "orderedList" ||
    node.type === "listItem" ||
    node.type === "codeBlock";
  return isBlock ? children.join("") + (children.length ? "\n" : "") : children.join("");
}

type Mark = { type: string; attrs?: Record<string, unknown> };

// Atlassian palette mapping for the named colors Jira's wiki markup accepts.
// Unknown names fall back to a neutral gray so we never produce invalid ADF.
const COLOR_NAME_TO_HEX: Record<string, string> = {
  red: "#bf2600",
  green: "#00875a",
  blue: "#0747a6",
  yellow: "#ff991f",
  orange: "#ff8b00",
  purple: "#403294",
  black: "#172b4d",
  white: "#ffffff",
  gray: "#6b778c",
  grey: "#6b778c",
};

function colorToHex(name: string): string {
  return COLOR_NAME_TO_HEX[name.toLowerCase()] ?? "#6b778c";
}

function popMark(stack: Mark[], type: string): boolean {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i]?.type === type) {
      stack.splice(i, 1);
      return true;
    }
  }
  return false;
}

/**
 * Convert a Jira wiki-markup string into an ADF document so API v3 renders it with
 * formatting instead of as literal text. Recognized markup:
 *
 *   - `*bold*`              → strong
 *   - `[text|url]`          → link
 *   - `[~accountid:UUID]`   → mention node (Jira resolves to @username on render)
 *   - `{color:NAME}…{color}` → textColor (multi-line spans supported)
 *   - `\n`                  → paragraph break
 *
 * Plain strings with no markup are equivalent to `toAdf(text)`. Unrecognized markup
 * (italic `_`, lists, headings) is preserved as literal text — extend as needed.
 */
export function wikiToAdf(input: string): AdfDocument {
  const paragraphs: AdfDocument["content"] = [];
  let line: AdfDocument["content"][number]["content"] = [];
  let buffer = "";
  const activeMarks: Mark[] = [];

  const flush = () => {
    if (!buffer) return;
    const node: { type: "text"; text: string; marks?: Mark[] } = { type: "text", text: buffer };
    if (activeMarks.length) node.marks = activeMarks.map((m) => ({ ...m }));
    line.push(node);
    buffer = "";
  };

  const endParagraph = () => {
    flush();
    paragraphs.push({ type: "paragraph", content: line });
    line = [];
  };

  let i = 0;
  while (i < input.length) {
    const rest = input.slice(i);

    // {color:NAME}
    const colorOpen = /^\{color:([^}\n]+)\}/.exec(rest);
    if (colorOpen) {
      flush();
      activeMarks.push({ type: "textColor", attrs: { color: colorToHex(colorOpen[1] ?? "") } });
      i += colorOpen[0].length;
      continue;
    }

    // {color}
    if (rest.startsWith("{color}")) {
      flush();
      popMark(activeMarks, "textColor");
      i += "{color}".length;
      continue;
    }

    // [~accountid:UUID]  — Jira mention syntax. Emitted as a sibling-level mention node,
    // not a text mark, since ADF models mentions as a distinct inline node type.
    const mention = /^\[~accountid:([^\]\n]+)\]/.exec(rest);
    if (mention) {
      flush();
      line.push({ type: "mention", attrs: { id: mention[1] ?? "" } });
      i += mention[0].length;
      continue;
    }

    // [text|url]
    if (rest.startsWith("[")) {
      const link = /^\[([^\]\n|]+)\|([^\]\n]+)\]/.exec(rest);
      if (link) {
        flush();
        const linkText = link[1] ?? "";
        const linkHref = link[2] ?? "";
        const linkMarks: Mark[] = [...activeMarks.map((m) => ({ ...m })), { type: "link", attrs: { href: linkHref } }];
        line.push({ type: "text", text: linkText, marks: linkMarks });
        i += link[0].length;
        continue;
      }
    }

    // *bold* — only treat as markup if a closing * exists on the same line and we're not already bold
    if (input[i] === "*") {
      const isCurrentlyBold = activeMarks.some((m) => m.type === "strong");
      if (!isCurrentlyBold) {
        const newlineIdx = input.indexOf("\n", i + 1);
        const closeIdx = input.indexOf("*", i + 1);
        if (closeIdx > i && (newlineIdx === -1 || closeIdx < newlineIdx)) {
          flush();
          activeMarks.push({ type: "strong" });
          i++;
          continue;
        }
      } else {
        flush();
        popMark(activeMarks, "strong");
        i++;
        continue;
      }
      // fall through: treat the `*` as a literal character
    }

    if (input[i] === "\n") {
      endParagraph();
      i++;
      continue;
    }

    buffer += input[i];
    i++;
  }

  endParagraph();
  return { type: "doc", version: 1, content: paragraphs };
}
