import { describe, it, expect } from "vitest";
import { JiraApi } from "../src/client.js";

describe("JiraApi constructor", () => {
  it("applies sensible defaults", () => {
    const jira = new JiraApi({ host: "jira.example.com" });
    expect(jira.protocol).toBe("http");
    expect(jira.apiVersion).toBe("2");
    expect(jira.base).toBe("");
    expect(jira.strictSSL).toBe(true);
    expect(jira.webhookVersion).toBe("1.0");
    expect(jira.greenhopperVersion).toBe("1.0");
  });

  it("honours explicit options", () => {
    const jira = new JiraApi({
      protocol: "https",
      host: "jira.example.com",
      port: "8443",
      apiVersion: "3",
      base: "/jira",
      strictSSL: false,
      webhookVersion: "2.0",
      greenhopperVersion: "1.5",
    });
    expect(jira.protocol).toBe("https");
    expect(jira.port).toBe("8443");
    expect(jira.apiVersion).toBe("3");
    expect(jira.base).toBe("/jira");
    expect(jira.strictSSL).toBe(false);
    expect(jira.webhookVersion).toBe("2.0");
    expect(jira.greenhopperVersion).toBe("1.5");
  });

  it("uses injected request function", async () => {
    const calls: Array<{ url: string; method?: string }> = [];
    const jira = new JiraApi({
      protocol: "https",
      host: "jira.example.com",
      request: async (url, init) => {
        calls.push({ url, method: init.method });
        return { key: "X-1" };
      },
    });
    const result = await jira.findIssue("X-1");
    expect(result).toEqual({ key: "X-1" });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toContain("/rest/api/2/issue/X-1");
  });
});
