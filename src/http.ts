import { Agent, fetch as undiciFetch } from "undici";
import type {
  HttpError,
  JiraApiOptions,
  RequestFunction,
  RequestInit,
} from "./types.js";
import type { AuthConfig } from "./auth.js";
import { buildAuthHeaders } from "./auth.js";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface HttpConfig {
  strictSSL: boolean;
  ca?: string | Buffer;
  timeout?: number;
  auth: AuthConfig;
}

function buildDispatcher(cfg: HttpConfig): unknown {
  if (cfg.strictSSL && !cfg.ca) return undefined;
  return new Agent({
    connect: {
      rejectUnauthorized: cfg.strictSSL,
      ...(cfg.ca ? { ca: cfg.ca } : {}),
    },
  });
}

function headersToRecord(h: Headers | Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  if (h instanceof Headers) {
    h.forEach((value, key) => {
      out[key.toLowerCase()] = value;
    });
    return out;
  }
  for (const [k, v] of Object.entries(h)) {
    out[k.toLowerCase()] = v;
  }
  return out;
}

async function executeFetch(
  url: string,
  init: RequestInit,
  cfg: HttpConfig,
  retry = true,
): Promise<any> {
  const method = (init.method || "GET").toUpperCase();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers || {}),
    ...buildAuthHeaders(cfg.auth, method, url),
  };

  let body: unknown;
  if (init.formData) {
    body = init.formData;
  } else if (init.body !== undefined) {
    if (init.json !== false && typeof init.body !== "string") {
      body = JSON.stringify(init.body);
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    } else {
      body = init.body;
    }
  }

  const signal = cfg.timeout ? AbortSignal.timeout(cfg.timeout) : undefined;
  const dispatcher = buildDispatcher(cfg);

  const response = await undiciFetch(url, {
    method,
    headers,
    body,
    signal,
    ...(dispatcher ? { dispatcher } : {}),
  } as any);

  const responseHeaders = headersToRecord(response.headers);
  const contentType = responseHeaders["content-type"] || "";

  let parsedBody: unknown;
  const text = await response.text();
  if (text.length === 0) {
    parsedBody = undefined;
  } else if (contentType.includes("application/json")) {
    try {
      parsedBody = JSON.parse(text);
    } catch {
      parsedBody = text;
    }
  } else {
    parsedBody = text;
  }

  if (response.status >= 400) {
    const retryAfterRaw = responseHeaders["retry-after"];
    if ((retryAfterRaw || response.status === 429) && retry) {
      const retryAfter = parseInt(retryAfterRaw || "0", 10) * 1000;
      await wait(retryAfter);
      return executeFetch(url, init, cfg, false);
    }
    const error: HttpError = {
      body: parsedBody,
      headers: responseHeaders,
      statusCode: response.status,
      ...(retryAfterRaw ? { retryAfter: parseInt(retryAfterRaw, 10) } : {}),
    };
    throw error;
  }

  return parsedBody;
}

export function makeRequestFunction(cfg: HttpConfig): RequestFunction {
  return (url: string, init: RequestInit) => executeFetch(url, init, cfg, true);
}

export function buildHttpConfig(options: JiraApiOptions): HttpConfig {
  const auth: AuthConfig = {};
  if (options.oauth && options.oauth.consumer_key && options.oauth.access_token) {
    auth.oauth = options.oauth;
  } else if (options.bearer) {
    auth.bearer = options.bearer;
  } else if (options.username && options.password) {
    auth.basic = { username: options.username, password: options.password };
  }
  return {
    strictSSL: options.strictSSL !== false,
    ...(options.ca ? { ca: options.ca } : {}),
    ...(options.timeout ? { timeout: options.timeout } : {}),
    auth,
  };
}
