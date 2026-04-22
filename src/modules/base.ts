import type {
  JiraApiOptions,
  RequestFunction,
  RequestInit,
  UriOptions,
} from "../types.js";
import { buildHttpConfig, makeRequestFunction } from "../http.js";
import type { UriContext } from "../uri.js";
import {
  makeAgileUri,
  makeDevStatusUri,
  makeSprintQueryUri,
  makeUri,
  makeWebhookUri,
} from "../uri.js";

export class BaseClient {
  public readonly protocol: string;
  public readonly host: string;
  public readonly port: string | null;
  public readonly apiVersion: string;
  public readonly base: string;
  public readonly intermediatePath: string | undefined;
  public readonly strictSSL: boolean;
  public readonly webhookVersion: string;
  public readonly greenhopperVersion: string;
  /** @internal */
  public readonly request: RequestFunction;

  constructor(options: JiraApiOptions) {
    this.protocol = options.protocol || "http";
    this.host = options.host;
    this.port = options.port || null;
    this.apiVersion = options.apiVersion || "2";
    this.base = options.base || "";
    this.intermediatePath = options.intermediatePath;
    this.strictSSL =
      options.strictSSL === undefined ? true : options.strictSSL;
    this.webhookVersion = options.webhookVersion || "1.0";
    this.greenhopperVersion = options.greenhopperVersion || "1.0";

    this.request =
      options.request || makeRequestFunction(buildHttpConfig(options));
  }

  /** @internal */
  uriContext(): UriContext {
    return {
      protocol: this.protocol,
      host: this.host,
      port: this.port,
      base: this.base,
      apiVersion: this.apiVersion,
      ...(this.intermediatePath !== undefined
        ? { intermediatePath: this.intermediatePath }
        : {}),
      webhookVersion: this.webhookVersion,
      greenhopperVersion: this.greenhopperVersion,
    };
  }

  makeUri(options: UriOptions): string {
    return makeUri(this.uriContext(), options);
  }

  makeWebhookUri(options: UriOptions): string {
    return makeWebhookUri(this.uriContext(), options);
  }

  makeSprintQueryUri(options: UriOptions): string {
    return makeSprintQueryUri(this.uriContext(), options);
  }

  makeDevStatusUri(options: UriOptions): string {
    return makeDevStatusUri(this.uriContext(), options);
  }

  makeAgileUri(options: UriOptions): string {
    return makeAgileUri(this.uriContext(), options);
  }

  makeRequestHeader(uri: string, options: Partial<RequestInit> = {}): RequestInit & { uri: string } {
    return {
      method: options.method || "GET",
      json: true,
      ...options,
      uri,
    } as RequestInit & { uri: string };
  }

  async doRequest<T = any>(requestOptions: RequestInit & { uri?: string; url?: string }): Promise<T> {
    const url = requestOptions.uri || requestOptions.url;
    if (!url) throw new Error("doRequest requires a uri");
    const { uri: _uri, url: _url, ...init } = requestOptions;
    return this.request(url, init) as Promise<T>;
  }
}

export type Constructor<T = object> = new (...args: any[]) => T;
export type BaseCtor = Constructor<BaseClient>;
