import type { BaseCtor } from "./base.js";
import type { JsonResponse, LinkObject } from "../types.js";

export function LinksMixin<TBase extends BaseCtor>(Base: TBase) {
  return class LinksMixin extends Base {
    issueLink(link: LinkObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/issueLink" }), {
          method: "POST",
          body: link,
        }),
      );
    }

    deleteIssueLink(linkId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issueLink/${linkId}` }),
          { method: "DELETE" },
        ),
      );
    }

    listIssueLinkTypes(): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: "/issueLinkType" }),
        ),
      );
    }

    getRemoteLinks(issueNumber: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueNumber}/remotelink` }),
        ),
      );
    }

    createRemoteLink(
      issueNumber: string,
      remoteLink: LinkObject,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueNumber}/remotelink` }),
          { method: "POST", body: remoteLink },
        ),
      );
    }

    deleteRemoteLink(
      issueNumber: string,
      id: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueNumber}/remotelink/${id}`,
          }),
          { method: "DELETE" },
        ),
      );
    }
  };
}
