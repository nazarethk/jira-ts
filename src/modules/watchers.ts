import type { BaseCtor } from "./base.js";
import type { JsonResponse } from "../types.js";

export function WatchersMixin<TBase extends BaseCtor>(Base: TBase) {
  return class WatchersMixin extends Base {
    addWatcher(issueKey: string, username: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueKey}/watchers` }),
          { method: "POST", body: username },
        ),
      );
    }

    getIssueWatchers(issueNumber: string): Promise<JsonResponse[]> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueNumber}/watchers`,
          }),
        ),
      );
    }
  };
}
