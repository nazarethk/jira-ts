import type { BaseCtor } from "./base.js";
import type {
  JsonResponse,
  Query,
  RemoveAndSwapVersionBody,
  VersionObject,
} from "../types.js";

export function VersionsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class VersionsMixin extends Base {
    getVersions(project: string, query: Query = {}): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/project/${project}/versions`,
            query,
          }),
        ),
      );
    }

    getVersion(version: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/version/${version}` }),
        ),
      );
    }

    createVersion(version: VersionObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/version" }), {
          method: "POST",
          body: version,
        }),
      );
    }

    updateVersion(version: VersionObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/version/${version.id}` }),
          { method: "PUT", body: version },
        ),
      );
    }

    /**
     * Delete a version. On `apiVersion: '3'` this calls `POST /version/{id}/removeAndSwap`
     * (the v3 replacement); on v2 it falls back to the deprecated `DELETE /version/{id}`.
     */
    deleteVersion(
      versionId: string,
      moveFixIssuesToId?: string,
      moveAffectedIssuesToId?: string,
    ): Promise<JsonResponse> {
      if (this.apiVersion === "3") {
        const body: RemoveAndSwapVersionBody = {
          ...(moveFixIssuesToId ? { moveFixIssuesTo: moveFixIssuesToId } : {}),
          ...(moveAffectedIssuesToId
            ? { moveAffectedIssuesTo: moveAffectedIssuesToId }
            : {}),
        };
        return this.doRequest(
          this.makeRequestHeader(
            this.makeUri({
              pathname: `/version/${versionId}/removeAndSwap`,
            }),
            { method: "POST", body },
          ),
        );
      }

      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/version/${versionId}`,
            query: {
              ...(moveFixIssuesToId
                ? { moveFixIssuesTo: moveFixIssuesToId }
                : {}),
              ...(moveAffectedIssuesToId
                ? { moveAffectedIssuesTo: moveAffectedIssuesToId }
                : {}),
            },
          }),
          { method: "DELETE" },
        ),
      );
    }

    removeAndSwapVersion(
      versionId: string,
      body: RemoveAndSwapVersionBody = {},
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/version/${versionId}/removeAndSwap`,
          }),
          { method: "POST", body },
        ),
      );
    }

    moveVersion(
      versionId: string,
      position: string | JsonResponse,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/version/${versionId}/move` }),
          { method: "POST", body: position },
        ),
      );
    }

    async getUnresolvedIssueCount(version: string): Promise<number> {
      const response = await this.doRequest<JsonResponse>(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/version/${version}/unresolvedIssueCount`,
          }),
        ),
      );
      return response.issuesUnresolvedCount as number;
    }

    getAllVersions(
      boardId: string,
      startAt = 0,
      maxResults = 50,
      released?: "true" | "false",
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/version`,
            query: {
              startAt,
              maxResults,
              ...(released ? { released } : {}),
            },
          }),
        ),
      );
    }
  };
}
