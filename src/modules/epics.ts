import type { BaseCtor } from "./base.js";
import type { JsonResponse } from "../types.js";

export function EpicsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class EpicsMixin extends Base {
    getEpics(
      boardId: string,
      startAt = 0,
      maxResults = 50,
      done?: "true" | "false",
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/epic`,
            query: {
              startAt,
              maxResults,
              ...(done ? { done } : {}),
            },
          }),
        ),
      );
    }

    getBoardIssuesForEpic(
      boardId: string,
      epicId: string,
      startAt = 0,
      maxResults = 50,
      jql?: string,
      validateQuery = true,
      fields?: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/epic/${epicId}/issue`,
            query: {
              startAt,
              maxResults,
              ...(jql ? { jql } : {}),
              validateQuery,
              ...(fields ? { fields } : {}),
            },
          }),
        ),
      );
    }

    getEpic(epicIdOrKey: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/epic/${epicIdOrKey}` }),
        ),
      );
    }

    partiallyUpdateEpic(
      epicIdOrKey: string,
      body: string | JsonResponse,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/epic/${epicIdOrKey}` }),
          { method: "POST", body },
        ),
      );
    }

    getIssuesForEpic(
      epicId: string,
      startAt = 0,
      maxResults = 50,
      jql?: string,
      validateQuery = true,
      fields?: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/epic/${epicId}/issue`,
            query: {
              startAt,
              maxResults,
              ...(jql ? { jql } : {}),
              validateQuery,
              ...(fields ? { fields } : {}),
            },
          }),
        ),
      );
    }

    moveIssuesToEpic(
      epicIdOrKey: string,
      issues: string[],
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/epic/${epicIdOrKey}/issue` }),
          { method: "POST", body: { issues } },
        ),
      );
    }

    rankEpics(
      epicIdOrKey: string,
      body: string | JsonResponse,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/epic/${epicIdOrKey}/rank` }),
          { method: "PUT", body },
        ),
      );
    }
  };
}
