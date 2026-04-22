import { describe, it, expect } from "vitest";
import { JiraApi } from "../src/client.js";

function makeJira(overrides = {}) {
  return new JiraApi({
    protocol: "https",
    host: "jira.example.com",
    username: "u",
    password: "p",
    request: async () => undefined,
    ...overrides,
  });
}

describe("uri builders", () => {
  it("makeUri builds /rest/api/<version>/<pathname>", () => {
    const jira = makeJira();
    const uri = jira.makeUri({ pathname: "/issue/FOO-1" });
    expect(uri).toBe("https://jira.example.com/rest/api/2/issue/FOO-1");
  });

  it("respects apiVersion", () => {
    const jira = makeJira({ apiVersion: "3" });
    const uri = jira.makeUri({ pathname: "/issue/FOO-1" });
    expect(uri).toBe("https://jira.example.com/rest/api/3/issue/FOO-1");
  });

  it("serialises query params", () => {
    const jira = makeJira();
    const uri = jira.makeUri({
      pathname: "/search/jql",
      query: { fields: "summary", maxResults: 10 },
    });
    expect(uri).toContain("/rest/api/2/search/jql?");
    expect(uri).toContain("fields=summary");
    expect(uri).toContain("maxResults=10");
  });

  it("honours intermediatePath", () => {
    const jira = makeJira();
    const uri = jira.makeUri({
      pathname: "/foo",
      intermediatePath: "/custom/path",
    });
    expect(uri).toBe("https://jira.example.com/custom/path/foo");
  });

  it("uses port when provided", () => {
    const jira = makeJira({ port: "8080" });
    const uri = jira.makeUri({ pathname: "/issue/X-1" });
    expect(uri).toBe("https://jira.example.com:8080/rest/api/2/issue/X-1");
  });

  it("makeAgileUri targets /rest/agile/1.0", () => {
    const jira = makeJira();
    expect(jira.makeAgileUri({ pathname: "/board/42" })).toBe(
      "https://jira.example.com/rest/agile/1.0/board/42",
    );
  });

  it("makeWebhookUri targets /rest/webhooks/1.0", () => {
    const jira = makeJira();
    expect(jira.makeWebhookUri({ pathname: "/webhook" })).toBe(
      "https://jira.example.com/rest/webhooks/1.0/webhook",
    );
  });

  it("makeDevStatusUri targets /rest/dev-status/latest/issue", () => {
    const jira = makeJira();
    expect(jira.makeDevStatusUri({ pathname: "/summary" })).toBe(
      "https://jira.example.com/rest/dev-status/latest/issue/summary",
    );
  });

  it("makeSprintQueryUri targets /rest/greenhopper/1.0", () => {
    const jira = makeJira();
    expect(jira.makeSprintQueryUri({ pathname: "/rapidviews/list" })).toBe(
      "https://jira.example.com/rest/greenhopper/1.0/rapidviews/list",
    );
  });
});
