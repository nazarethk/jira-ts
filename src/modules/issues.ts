import type { BaseCtor } from "./base.js";
import type {
  ArchiveIssuesPayload,
  BulkCreateIssuesPayload,
  BulkFetchIssuesPayload,
  IssueObject,
  JsonResponse,
  Query,
  TransitionObject,
} from "../types.js";

export function IssuesMixin<TBase extends BaseCtor>(Base: TBase) {
  return class IssuesMixin extends Base {
    findIssue(
      issueNumber: string,
      expand?: string,
      fields?: string,
      properties?: string,
      fieldsByKeys?: boolean,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueNumber}`,
            query: {
              expand: expand || "",
              fields: fields || "*all",
              properties: properties || "*all",
              fieldsByKeys: fieldsByKeys || false,
            },
          }),
        ),
      );
    }

    getIssue(
      issueIdOrKey: string,
      fields?: string | string[],
      expand?: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/issue/${issueIdOrKey}`,
            query: {
              ...(fields !== undefined ? { fields } : {}),
              ...(expand !== undefined ? { expand } : {}),
            },
          }),
        ),
      );
    }

    addNewIssue(issue: IssueObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/issue" }), {
          method: "POST",
          body: issue,
        }),
      );
    }

    deleteIssue(issueId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueId}` }),
          { method: "DELETE" },
        ),
      );
    }

    updateIssue(
      issueId: string,
      issueUpdate: IssueObject,
      query: Query = {},
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueId}`, query }),
          { method: "PUT", body: issueUpdate },
        ),
      );
    }

    listTransitions(issueId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueId}/transitions`,
            query: { expand: "transitions.fields" },
          }),
        ),
      );
    }

    transitionIssue(
      issueId: string,
      issueTransition: TransitionObject,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueId}/transitions` }),
          { method: "POST", body: issueTransition },
        ),
      );
    }

    updateAssignee(
      issueKey: string,
      assigneeName: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueKey}/assignee` }),
          { method: "PUT", body: { name: assigneeName } },
        ),
      );
    }

    updateAssigneeWithId(
      issueKey: string,
      userId: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueKey}/assignee` }),
          { method: "PUT", body: { accountId: userId } },
        ),
      );
    }

    getIssueProperty(
      issueNumber: string,
      property: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueNumber}/properties/${property}`,
          }),
        ),
      );
    }

    getIssueChangelog(
      issueNumber: string,
      startAt = 0,
      maxResults = 50,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueNumber}/changelog`,
            query: { startAt, maxResults },
          }),
        ),
      );
    }

    issueNotify(
      issueId: string,
      notificationBody: JsonResponse,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueId}/notify` }),
          { method: "POST", body: notificationBody },
        ),
      );
    }

    moveToBacklog(issues: string[]): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: "/backlog/issue" }),
          { method: "POST", body: { issues } },
        ),
      );
    }

    rankIssues(body: string | JsonResponse): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: "/issue/rank" }),
          { method: "PUT", body },
        ),
      );
    }

    bulkCreateIssues(
      payload: BulkCreateIssuesPayload,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/issue/bulk" }), {
          method: "POST",
          body: payload,
        }),
      );
    }

    bulkFetchIssues(
      payload: BulkFetchIssuesPayload,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: "/issue/bulkfetch" }),
          { method: "POST", body: payload },
        ),
      );
    }

    archiveIssues(payload: ArchiveIssuesPayload): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/issue/archive" }), {
          method: "PUT",
          body: payload,
        }),
      );
    }
  };
}
