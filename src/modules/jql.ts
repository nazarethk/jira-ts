import type { BaseCtor } from "./base.js";
import type { JsonResponse, ParseJqlPayload, SearchQuery } from "../types.js";

export function JqlMixin<TBase extends BaseCtor>(Base: TBase) {
  return class JqlMixin extends Base {
    searchJira(
      searchString: string,
      optional: SearchQuery = {},
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/search/jql" }), {
          method: "POST",
          body: { jql: searchString, ...optional },
        }),
      );
    }

    parseJql(
      queries: string[],
      validation?: "strict" | "warn" | "none",
    ): Promise<JsonResponse> {
      const payload: ParseJqlPayload = { queries };
      const query = validation ? { validation } : {};
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: "/jql/parse", query }),
          { method: "POST", body: payload },
        ),
      );
    }

    approximateIssueCount(jql: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: "/search/approximate-count" }),
          { method: "POST", body: { jql } },
        ),
      );
    }
  };
}
