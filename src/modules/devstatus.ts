import type { BaseCtor } from "./base.js";
import type { JsonResponse } from "../types.js";

export function DevStatusMixin<TBase extends BaseCtor>(Base: TBase) {
  return class DevStatusMixin extends Base {
    getDevStatusSummary(issueId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeDevStatusUri({
            pathname: "/summary",
            query: { issueId },
          }),
        ),
      );
    }

    getDevStatusDetail(
      issueId: string,
      applicationType: string,
      dataType: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeDevStatusUri({
            pathname: "/detail",
            query: { issueId, applicationType, dataType },
          }),
        ),
      );
    }
  };
}
