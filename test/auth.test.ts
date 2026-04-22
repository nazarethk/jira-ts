import { describe, it, expect } from "vitest";
import { buildAuthHeaders } from "../src/auth.js";

describe("auth header builders", () => {
  it("produces a basic auth header", () => {
    const headers = buildAuthHeaders(
      { basic: { username: "alice", password: "s3cret" } },
      "GET",
      "https://jira.example.com/rest/api/2/myself",
    );
    expect(headers.Authorization).toMatch(/^Basic /);
    const decoded = Buffer.from(
      headers.Authorization!.replace(/^Basic /, ""),
      "base64",
    ).toString();
    expect(decoded).toBe("alice:s3cret");
  });

  it("produces a bearer auth header", () => {
    const headers = buildAuthHeaders(
      { bearer: "token-xyz" },
      "GET",
      "https://jira.example.com/rest/api/2/myself",
    );
    expect(headers.Authorization).toBe("Bearer token-xyz");
  });

  it("produces an OAuth 1.0a header with HMAC-SHA1", () => {
    const headers = buildAuthHeaders(
      {
        oauth: {
          consumer_key: "ck",
          consumer_secret: "cs",
          access_token: "at",
          access_token_secret: "ats",
          signature_method: "HMAC-SHA1",
        },
      },
      "GET",
      "https://jira.example.com/rest/api/2/myself",
    );
    expect(headers.Authorization).toMatch(/^OAuth /);
    expect(headers.Authorization).toContain(
      'oauth_signature_method="HMAC-SHA1"',
    );
    expect(headers.Authorization).toContain('oauth_consumer_key="ck"');
    expect(headers.Authorization).toMatch(/oauth_signature="[^"]+"/);
  });

  it("emits no header when unauthenticated", () => {
    const headers = buildAuthHeaders(
      {},
      "GET",
      "https://jira.example.com/rest/api/2/myself",
    );
    expect(headers.Authorization).toBeUndefined();
  });
});
