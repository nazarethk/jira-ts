import { describe, it, expect } from "vitest";
import { JiraApi } from "../src/client.js";
import type { RequestFunction, RequestInit } from "../src/types.js";

interface Call {
  url: string;
  init: RequestInit;
}

function spyClient(apiVersion = "3") {
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

describe("v3 endpoint migrations", () => {
  it("searchProjects hits /project/search", async () => {
    const { jira, calls } = spyClient();
    await jira.searchProjects({ query: "foo", maxResults: 25 });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toContain("/rest/api/3/project/search");
    expect(calls[0]!.url).toContain("query=foo");
    expect(calls[0]!.url).toContain("maxResults=25");
  });

  it("getCreateMetaIssueTypes hits /issue/createmeta/{projectIdOrKey}/issuetypes", async () => {
    const { jira, calls } = spyClient();
    await jira.getCreateMetaIssueTypes("PROJ", 10, 5);
    expect(calls[0]!.url).toContain(
      "/rest/api/3/issue/createmeta/PROJ/issuetypes",
    );
    expect(calls[0]!.url).toContain("startAt=10");
    expect(calls[0]!.url).toContain("maxResults=5");
  });

  it("getCreateMetaIssueTypeFields hits the per-issuetype endpoint", async () => {
    const { jira, calls } = spyClient();
    await jira.getCreateMetaIssueTypeFields("PROJ", "10100");
    expect(calls[0]!.url).toContain(
      "/rest/api/3/issue/createmeta/PROJ/issuetypes/10100",
    );
  });

  it("deleteVersion on v3 posts to /version/{id}/removeAndSwap", async () => {
    const { jira, calls } = spyClient("3");
    await jira.deleteVersion("10", "11", "12");
    expect(calls[0]!.url).toContain("/rest/api/3/version/10/removeAndSwap");
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.init.body).toEqual({
      moveFixIssuesTo: "11",
      moveAffectedIssuesTo: "12",
    });
  });

  it("deleteVersion on v2 still uses DELETE /version/{id}", async () => {
    const { jira, calls } = spyClient("2");
    await jira.deleteVersion("10", "11", "12");
    expect(calls[0]!.url).toContain("/rest/api/2/version/10");
    expect(calls[0]!.url).not.toContain("removeAndSwap");
    expect(calls[0]!.init.method).toBe("DELETE");
  });

  it("addComment on v3 wraps string as ADF", async () => {
    const { jira, calls } = spyClient("3");
    await jira.addComment("X-1", "hello");
    expect(calls[0]!.init.body).toEqual({
      body: {
        type: "doc",
        version: 1,
        content: [
          { type: "paragraph", content: [{ type: "text", text: "hello" }] },
        ],
      },
    });
  });

  it("addComment on v2 sends the raw string", async () => {
    const { jira, calls } = spyClient("2");
    await jira.addComment("X-1", "hello");
    expect(calls[0]!.init.body).toEqual({ body: "hello" });
  });

  it("updateComment on v3 wraps string as ADF", async () => {
    const { jira, calls } = spyClient("3");
    await jira.updateComment("X-1", "42", "updated");
    const body = calls[0]!.init.body as { body: unknown };
    expect(body.body).toHaveProperty("type", "doc");
  });

  it("addWorklog on v3 wraps string comment as ADF", async () => {
    const { jira, calls } = spyClient("3");
    await jira.addWorklog("X-1", { comment: "worked", timeSpent: "1h" });
    const body = calls[0]!.init.body as { comment: unknown; timeSpent: string };
    expect(body.comment).toHaveProperty("type", "doc");
    expect(body.timeSpent).toBe("1h");
  });

  it("bulkCreateIssues hits POST /issue/bulk", async () => {
    const { jira, calls } = spyClient();
    await jira.bulkCreateIssues({ issueUpdates: [{ fields: {} }] });
    expect(calls[0]!.url).toContain("/rest/api/3/issue/bulk");
    expect(calls[0]!.init.method).toBe("POST");
  });

  it("parseJql hits POST /jql/parse", async () => {
    const { jira, calls } = spyClient();
    await jira.parseJql(["project = X"]);
    expect(calls[0]!.url).toContain("/rest/api/3/jql/parse");
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.init.body).toEqual({ queries: ["project = X"] });
  });

  it("approximateIssueCount hits POST /search/approximate-count", async () => {
    const { jira, calls } = spyClient();
    await jira.approximateIssueCount("project = X");
    expect(calls[0]!.url).toContain("/rest/api/3/search/approximate-count");
    expect(calls[0]!.init.method).toBe("POST");
  });

  it("searchJira hits /search/jql (not the deprecated /search)", async () => {
    const { jira, calls } = spyClient();
    await jira.searchJira("project = X");
    expect(calls[0]!.url).toContain("/rest/api/3/search/jql");
    expect(calls[0]!.init.method).toBe("POST");
  });
});
