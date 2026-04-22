import type { ReadStream } from "node:fs";
import type { BaseCtor } from "./base.js";
import type { AttachmentObject, JsonResponse } from "../types.js";

export function AttachmentsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class AttachmentsMixin extends Base {
    downloadAttachment(attachment: AttachmentObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/attachment/${attachment.id}/${attachment.filename}`,
            intermediatePath: "/secure",
            encode: true,
          }),
          { json: false },
        ),
      );
    }

    deleteAttachment(attachmentId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/attachment/${attachmentId}` }),
          { method: "DELETE", json: false },
        ),
      );
    }

    async addAttachmentOnIssue(
      issueId: string,
      readStream: ReadStream,
    ): Promise<JsonResponse> {
      const form = new FormData();
      const chunks: Buffer[] = [];
      for await (const chunk of readStream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const fileName =
        (readStream as ReadStream & { path?: string | Buffer }).path
          ?.toString()
          .split("/")
          .pop() || "attachment";
      const blob = new Blob([Buffer.concat(chunks) as unknown as ArrayBuffer]);
      form.append("file", blob, fileName);

      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/issue/${issueId}/attachments` }),
          {
            method: "POST",
            headers: { "X-Atlassian-Token": "nocheck" },
            formData: form,
          },
        ),
      );
    }
  };
}
