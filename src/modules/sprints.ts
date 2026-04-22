import type { BaseCtor } from "./base.js";
import type { JsonResponse } from "../types.js";

export function SprintsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class SprintsMixin extends Base {
    /**
     * @deprecated Uses the undocumented `/rest/greenhopper/1.0/rapidviews/list` endpoint.
     * Prefer `getAllBoards` from the Agile API.
     */
    async findRapidView(projectName?: string): Promise<JsonResponse | JsonResponse[]> {
      const response = await this.doRequest<{ views: JsonResponse[] }>(
        this.makeRequestHeader(
          this.makeSprintQueryUri({ pathname: "/rapidviews/list" }),
        ),
      );
      if (projectName === undefined || projectName === null) return response.views;
      return response.views.find(
        (x) => String(x.name).toLowerCase() === projectName.toLowerCase(),
      ) as JsonResponse;
    }

    /**
     * @deprecated Greenhopper internal endpoint. Prefer `getAllSprints` from the Agile API.
     */
    async getLastSprintForRapidView(
      rapidViewId: string,
    ): Promise<JsonResponse> {
      const response = await this.doRequest<{ sprints: JsonResponse[] }>(
        this.makeRequestHeader(
          this.makeSprintQueryUri({
            pathname: `/sprintquery/${rapidViewId}`,
          }),
        ),
      );
      return response.sprints[response.sprints.length - 1] as JsonResponse;
    }

    /**
     * @deprecated Greenhopper internal endpoint. Prefer `getBoardIssuesForSprint` from the Agile API.
     */
    getSprintIssues(
      rapidViewId: string,
      sprintId: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeSprintQueryUri({
            pathname: "/rapid/charts/sprintreport",
            query: { rapidViewId, sprintId },
          }),
        ),
      );
    }

    /**
     * @deprecated Greenhopper internal endpoint. Prefer `getAllSprints(boardId)` from the Agile API.
     */
    listSprints(rapidViewId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeSprintQueryUri({
            pathname: `/sprintquery/${rapidViewId}`,
          }),
        ),
      );
    }

    getSprint(sprintId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/sprint/${sprintId}` }),
        ),
      );
    }

    addIssueToSprint(
      issueId: string,
      sprintId: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/sprint/${sprintId}/issue` }),
          { method: "POST", body: { issues: [issueId] } },
        ),
      );
    }

    /**
     * @deprecated Greenhopper internal endpoint. Prefer `getIssuesForBacklog(boardId, ...)` from the Agile API.
     */
    getBacklogForRapidView(rapidViewId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/xboard/plan/backlog/data",
            query: { rapidViewId },
          }),
        ),
      );
    }

    getAllSprints(
      boardId: string,
      startAt = 0,
      maxResults = 50,
      state?: "future" | "active" | "closed",
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/sprint`,
            query: {
              startAt,
              maxResults,
              ...(state ? { state } : {}),
            },
          }),
        ),
      );
    }

    getBoardIssuesForSprint(
      boardId: string,
      sprintId: string,
      startAt = 0,
      maxResults = 50,
      jql?: string,
      validateQuery = true,
      fields?: string,
      expand?: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/sprint/${sprintId}/issue`,
            query: {
              startAt,
              maxResults,
              ...(jql ? { jql } : {}),
              validateQuery,
              ...(fields ? { fields } : {}),
              ...(expand ? { expand } : {}),
            },
          }),
        ),
      );
    }
  };
}
