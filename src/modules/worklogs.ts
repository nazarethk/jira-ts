import type { BaseCtor } from "./base.js";
import type {
  EstimateObject,
  JsonResponse,
  WorklogObject,
  WorklogOptions,
} from "../types.js";
import { toAdf, isAdfDocument } from "../adf.js";

export function WorklogsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class WorklogsMixin extends Base {
    addWorklog(
      issueId: string,
      worklog: WorklogObject,
      newEstimate: EstimateObject | null = null,
      options: WorklogOptions = {},
    ): Promise<JsonResponse> {
      const query = {
        adjustEstimate: newEstimate ? "new" : "auto",
        ...(newEstimate ? { newEstimate } : {}),
        ...options,
      };

      let bodyWorklog: WorklogObject = worklog;
      if (
        this.apiVersion === "3" &&
        typeof worklog.comment === "string" &&
        !isAdfDocument(worklog.comment)
      ) {
        bodyWorklog = { ...worklog, comment: toAdf(worklog.comment) };
      }

      return this.doRequest({
        uri: this.makeUri({
          pathname: `/issue/${issueId}/worklog`,
          query,
        }),
        body: bodyWorklog,
        method: "POST",
        json: true,
      });
    }

    updatedWorklogs(since: number, expand?: string): Promise<JsonResponse> {
      return this.doRequest({
        uri: this.makeUri({
          pathname: "/worklog/updated",
          query: { since, ...(expand ? { expand } : {}) },
        }),
        method: "GET",
        json: true,
      });
    }

    deleteWorklog(
      issueId: string,
      worklogId: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueId}/worklog/${worklogId}`,
          }),
          { method: "DELETE" },
        ),
      );
    }

    updateWorklog(
      issueId: string,
      worklogId: string,
      body: WorklogObject,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueId}/worklog/${worklogId}`,
          }),
          { method: "PUT", body },
        ),
      );
    }

    getWorklogs(
      worklogsIDs: string[],
      expand?: string,
    ): Promise<JsonResponse[]> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/worklog/list",
            query: expand ? { expand } : {},
          }),
          { method: "POST", body: { ids: worklogsIDs } },
        ),
      );
    }

    getIssueWorklogs(
      issueId: string,
      startAt = 0,
      maxResults = 1000,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueId}/worklog`,
            query: { startAt, maxResults },
          }),
        ),
      );
    }
  };
}
