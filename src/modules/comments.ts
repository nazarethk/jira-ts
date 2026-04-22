import type { BaseCtor } from "./base.js";
import type {
  CommentAdvancedObject,
  CommentOptions,
  JsonResponse,
} from "../types.js";
import { toAdf } from "../adf.js";

export function CommentsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class CommentsMixin extends Base {
    addComment(issueId: string, comment: string): Promise<JsonResponse> {
      const body = this.apiVersion === "3" ? toAdf(comment) : comment;
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueId}/comment` }),
          { method: "POST", body: { body } },
        ),
      );
    }

    addCommentAdvanced(
      issueId: string,
      comment: CommentAdvancedObject,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueId}/comment` }),
          { method: "POST", body: comment },
        ),
      );
    }

    updateComment(
      issueId: string,
      commentId: string | number,
      comment: string,
      options: CommentOptions = {},
    ): Promise<JsonResponse> {
      const body = this.apiVersion === "3" ? toAdf(comment) : comment;
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueId}/comment/${commentId}`,
          }),
          { method: "PUT", body: { body, ...options } },
        ),
      );
    }

    getComments(issueId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueId}/comment` }),
        ),
      );
    }

    getComment(
      issueId: string,
      commentId: string | number,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueId}/comment/${commentId}`,
          }),
        ),
      );
    }

    deleteComment(
      issueId: string,
      commentId: string | number,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/${issueId}/comment/${commentId}`,
          }),
          { method: "DELETE" },
        ),
      );
    }
  };
}
