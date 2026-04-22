import type { BaseCtor } from "./base.js";
import type { JsonResponse, WebhookObject } from "../types.js";

export function WebhooksMixin<TBase extends BaseCtor>(Base: TBase) {
  return class WebhooksMixin extends Base {
    registerWebhook(webhook: WebhookObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeWebhookUri({ pathname: "/webhook" }),
          { method: "POST", body: webhook },
        ),
      );
    }

    listWebhooks(): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeWebhookUri({ pathname: "/webhook" }),
        ),
      );
    }

    getWebhook(webhookID: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeWebhookUri({ pathname: `/webhook/${webhookID}` }),
        ),
      );
    }

    deleteWebhook(webhookID: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeWebhookUri({ pathname: `/webhook/${webhookID}` }),
          { method: "DELETE" },
        ),
      );
    }
  };
}
