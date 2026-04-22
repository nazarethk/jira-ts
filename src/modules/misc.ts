import type { BaseCtor } from "./base.js";
import type { JsonResponse } from "../types.js";

export function MiscMixin<TBase extends BaseCtor>(Base: TBase) {
  return class MiscMixin extends Base {
    listStatus(): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/status" })),
      );
    }

    listPriorities(): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/priority" })),
      );
    }

    searchPriorities(
      options: {
        startAt?: number;
        maxResults?: number;
        id?: string[];
        onlyDefault?: boolean;
      } = {},
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/priority/search",
            query: options as Record<string, unknown>,
          }),
        ),
      );
    }

    listIssueTypes(): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/issuetype" })),
      );
    }

    searchStatuses(
      options: {
        startAt?: number;
        maxResults?: number;
        projectId?: string;
        searchString?: string;
      } = {},
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/statuses/search",
            query: options as Record<string, unknown>,
          }),
        ),
      );
    }

    getServerInfo(): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/serverInfo" })),
      );
    }

    getFilter(filterId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/filter/${filterId}` }),
        ),
      );
    }

    genericGet(endpoint: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/${endpoint}` }),
        ),
      );
    }

    genericAgileGet(endpoint: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/${endpoint}` }),
        ),
      );
    }
  };
}
