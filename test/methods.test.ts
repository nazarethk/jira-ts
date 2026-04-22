import { describe, it, expect } from "vitest";
import { JiraApi } from "../src/client.js";
import type { RequestFunction, RequestInit } from "../src/types.js";

interface Call {
  url: string;
  init: RequestInit;
}

function spyClient(apiVersion = "2") {
  const calls: Call[] = [];
  const request: RequestFunction = async (url, init) => {
    calls.push({ url, init });
    return { ok: true };
  };
  const jira = new JiraApi({
    protocol: "https",
    host: "jira.example.com",
    apiVersion,
    username: "u",
    password: "p",
    request,
  });
  return { jira, calls };
}

describe("core method routing", () => {
  it("findIssue GETs /issue/{key} with default query", async () => {
    const { jira, calls } = spyClient();
    await jira.findIssue("X-1");
    expect(calls[0]!.url).toContain("/rest/api/2/issue/X-1");
    expect(calls[0]!.url).toContain("fields=*all");
    expect(calls[0]!.init.method).toBe("GET");
  });

  it("getIssue uses the agile API", async () => {
    const { jira, calls } = spyClient();
    await jira.getIssue("X-1");
    expect(calls[0]!.url).toContain("/rest/agile/1.0/issue/X-1");
  });

  it("addNewIssue POSTs to /issue", async () => {
    const { jira, calls } = spyClient();
    await jira.addNewIssue({ fields: { summary: "x" } });
    expect(calls[0]!.url).toContain("/rest/api/2/issue");
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.init.body).toEqual({ fields: { summary: "x" } });
  });

  it("updateIssue PUTs to /issue/{id}", async () => {
    const { jira, calls } = spyClient();
    await jira.updateIssue("X-1", { fields: { summary: "y" } });
    expect(calls[0]!.url).toContain("/rest/api/2/issue/X-1");
    expect(calls[0]!.init.method).toBe("PUT");
  });

  it("transitionIssue POSTs to /issue/{id}/transitions", async () => {
    const { jira, calls } = spyClient();
    await jira.transitionIssue("X-1", { transition: { id: "10" } });
    expect(calls[0]!.url).toContain("/rest/api/2/issue/X-1/transitions");
    expect(calls[0]!.init.method).toBe("POST");
  });

  it("listProjects GETs /project (deprecated)", async () => {
    const { jira, calls } = spyClient();
    await jira.listProjects();
    expect(calls[0]!.url).toContain("/rest/api/2/project");
  });

  it("listComponents GETs /project/{key}/components", async () => {
    const { jira, calls } = spyClient();
    await jira.listComponents("PROJ");
    expect(calls[0]!.url).toContain("/rest/api/2/project/PROJ/components");
  });

  it("getVersions GETs /project/{key}/versions", async () => {
    const { jira, calls } = spyClient();
    await jira.getVersions("PROJ");
    expect(calls[0]!.url).toContain("/rest/api/2/project/PROJ/versions");
  });

  it("issueLink POSTs to /issueLink", async () => {
    const { jira, calls } = spyClient();
    await jira.issueLink({ type: { name: "Blocks" } });
    expect(calls[0]!.url).toContain("/rest/api/2/issueLink");
    expect(calls[0]!.init.method).toBe("POST");
  });

  it("getDevStatusSummary uses the dev-status URI", async () => {
    const { jira, calls } = spyClient();
    await jira.getDevStatusSummary("10001");
    expect(calls[0]!.url).toContain("/rest/dev-status/latest/issue/summary");
    expect(calls[0]!.url).toContain("issueId=10001");
  });

  it("getUser GETs /user?accountId=...", async () => {
    const { jira, calls } = spyClient();
    await jira.getUser("abc-123", "groups");
    expect(calls[0]!.url).toContain("/rest/api/2/user?");
    expect(calls[0]!.url).toContain("accountId=abc-123");
    expect(calls[0]!.url).toContain("expand=groups");
  });

  it("registerWebhook POSTs to the legacy webhooks path", async () => {
    const { jira, calls } = spyClient();
    await jira.registerWebhook({ name: "wh" });
    expect(calls[0]!.url).toContain("/rest/webhooks/1.0/webhook");
    expect(calls[0]!.init.method).toBe("POST");
  });

  it("findRapidView uses the greenhopper path", async () => {
    const requestFn: RequestFunction = async () => ({
      views: [{ id: 1, name: "Foo" }],
    });
    const jira = new JiraApi({
      protocol: "https",
      host: "jira.example.com",
      username: "u",
      password: "p",
      request: requestFn,
    });
    const result = await jira.findRapidView("Foo");
    expect(result).toEqual({ id: 1, name: "Foo" });
  });
});
