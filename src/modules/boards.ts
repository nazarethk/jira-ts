import type { BaseCtor } from "./base.js";
import type { BoardObject, JsonResponse } from "../types.js";

export function BoardsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class BoardsMixin extends Base {
    getAllBoards(
      startAt = 0,
      maxResults = 50,
      type?: string,
      name?: string,
      projectKeyOrId?: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: "/board",
            query: {
              startAt,
              maxResults,
              ...(type ? { type } : {}),
              ...(name ? { name } : {}),
              ...(projectKeyOrId ? { projectKeyOrId } : {}),
            },
          }),
        ),
      );
    }

    createBoard(boardBody: BoardObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeAgileUri({ pathname: "/board" }), {
          method: "POST",
          body: boardBody,
        }),
      );
    }

    getBoard(boardId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/board/${boardId}` }),
        ),
      );
    }

    deleteBoard(boardId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/board/${boardId}` }),
          { method: "DELETE" },
        ),
      );
    }

    getIssuesForBacklog(
      boardId: string,
      startAt = 0,
      maxResults = 50,
      jql?: string,
      validateQuery = true,
      fields?: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/backlog`,
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

    getConfiguration(boardId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/configuration`,
          }),
        ),
      );
    }

    getIssuesForBoard(
      boardId: string,
      startAt = 0,
      maxResults = 50,
      jql?: string,
      validateQuery = true,
      fields?: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/issue`,
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

    getIssueEstimationForBoard(
      issueIdOrKey: string,
      boardId: number | string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/issue/${issueIdOrKey}/estimation`,
            query: { boardId },
          }),
        ),
      );
    }

    estimateIssueForBoard(
      issueIdOrKey: string,
      boardId: number | string,
      body: string | JsonResponse,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/issue/${issueIdOrKey}/estimation`,
            query: { boardId },
          }),
          { method: "PUT", body },
        ),
      );
    }

    getBoardPropertiesKeys(boardId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/board/${boardId}/properties` }),
        ),
      );
    }

    deleteBoardProperty(
      boardId: string,
      propertyKey: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/properties/${propertyKey}`,
          }),
          { method: "DELETE" },
        ),
      );
    }

    setBoardProperty(
      boardId: string,
      propertyKey: string,
      body: string | JsonResponse,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/properties/${propertyKey}`,
          }),
          { method: "PUT", body },
        ),
      );
    }

    getBoardProperty(
      boardId: string,
      propertyKey: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/properties/${propertyKey}`,
          }),
        ),
      );
    }
  };
}
