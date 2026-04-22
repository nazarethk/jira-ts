import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type * as undiciModule from "undici";
import { makeRequestFunction } from "../src/http.js";

const mockFetch = vi.fn();

vi.mock("undici", async (importOriginal) => {
  const actual = await importOriginal<typeof undiciModule>();
  return {
    ...actual,
    fetch: (...args: unknown[]) => mockFetch(...args),
  };
});

function makeResponse(init: {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type") && init.body && typeof init.body === "object") {
    headers.set("content-type", "application/json");
  }
  const text =
    init.body === undefined
      ? ""
      : typeof init.body === "string"
        ? init.body
        : JSON.stringify(init.body);
  return {
    status: init.status,
    headers,
    text: async () => text,
  };
}

describe("http wrapper", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses JSON response on 2xx", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse({ status: 200, body: { key: "X-1" } }),
    );
    const request = makeRequestFunction({
      strictSSL: true,
      auth: { basic: { username: "u", password: "p" } },
    });
    const result = await request("https://jira.example.com/x", {
      method: "GET",
    });
    expect(result).toEqual({ key: "X-1" });
  });

  it("rejects with {body, headers, statusCode} on >=400", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse({
        status: 404,
        body: { errorMessages: ["Not Found"] },
        headers: { "x-trace-id": "abc" },
      }),
    );
    const request = makeRequestFunction({
      strictSSL: true,
      auth: {},
    });
    await expect(
      request("https://jira.example.com/x", { method: "GET" }),
    ).rejects.toMatchObject({
      statusCode: 404,
      body: { errorMessages: ["Not Found"] },
      headers: expect.objectContaining({ "x-trace-id": "abc" }),
    });
  });

  it("retries once on 429 with retry-after, then succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce(
        makeResponse({
          status: 429,
          headers: { "retry-after": "0" },
          body: { errorMessages: ["Too many"] },
        }),
      )
      .mockResolvedValueOnce(
        makeResponse({ status: 200, body: { ok: true } }),
      );
    const request = makeRequestFunction({ strictSSL: true, auth: {} });
    const result = await request("https://jira.example.com/x", {
      method: "GET",
    });
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("rejects after the single retry fails", async () => {
    mockFetch
      .mockResolvedValueOnce(
        makeResponse({
          status: 429,
          headers: { "retry-after": "0" },
          body: "rate limited",
        }),
      )
      .mockResolvedValueOnce(
        makeResponse({
          status: 429,
          headers: { "retry-after": "0" },
          body: "still rate limited",
        }),
      );
    const request = makeRequestFunction({ strictSSL: true, auth: {} });
    await expect(
      request("https://jira.example.com/x", { method: "GET" }),
    ).rejects.toMatchObject({ statusCode: 429 });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("injects basic auth header", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse({ status: 200, body: {} }),
    );
    const request = makeRequestFunction({
      strictSSL: true,
      auth: { basic: { username: "alice", password: "s3cret" } },
    });
    await request("https://jira.example.com/x", { method: "GET" });
    const init = mockFetch.mock.calls[0]![1] as {
      headers: Record<string, string>;
    };
    expect(init.headers.Authorization).toMatch(/^Basic /);
  });

  it("serialises object bodies as JSON", async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse({ status: 200, body: {} }),
    );
    const request = makeRequestFunction({ strictSSL: true, auth: {} });
    await request("https://jira.example.com/x", {
      method: "POST",
      body: { a: 1 },
    });
    const init = mockFetch.mock.calls[0]![1] as {
      body: string;
      headers: Record<string, string>;
    };
    expect(init.body).toBe('{"a":1}');
    expect(init.headers["Content-Type"]).toBe("application/json");
  });
});
