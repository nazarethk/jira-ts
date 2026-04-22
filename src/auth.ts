import { createHmac, createSign, randomBytes } from "node:crypto";
import type { OAuth } from "./types.js";

export interface AuthConfig {
  basic?: { username: string; password: string };
  bearer?: string;
  oauth?: OAuth;
}

export function buildAuthHeaders(
  auth: AuthConfig,
  method: string,
  url: string,
): Record<string, string> {
  if (auth.oauth) {
    return { Authorization: buildOAuthHeader(auth.oauth, method, url) };
  }
  if (auth.bearer) {
    return { Authorization: `Bearer ${auth.bearer}` };
  }
  if (auth.basic) {
    const token = Buffer.from(
      `${auth.basic.username}:${auth.basic.password}`,
    ).toString("base64");
    return { Authorization: `Basic ${token}` };
  }
  return {};
}

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function buildOAuthHeader(
  oauth: OAuth,
  method: string,
  targetUrl: string,
): string {
  const signatureMethod = oauth.signature_method || "RSA-SHA1";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString("hex");

  const parsed = new URL(targetUrl);
  const baseUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: oauth.consumer_key,
    oauth_nonce: nonce,
    oauth_signature_method: signatureMethod,
    oauth_timestamp: timestamp,
    oauth_token: oauth.access_token,
    oauth_version: "1.0",
  };

  const allParams: Record<string, string> = { ...oauthParams };
  for (const [k, v] of parsed.searchParams.entries()) {
    allParams[k] = v;
  }

  const paramString = Object.keys(allParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k] ?? "")}`)
    .join("&");

  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(baseUrl),
    percentEncode(paramString),
  ].join("&");

  const signingKey = `${percentEncode(oauth.consumer_secret)}&${percentEncode(
    oauth.access_token_secret || "",
  )}`;

  let signature: string;
  if (signatureMethod === "HMAC-SHA1") {
    signature = createHmac("sha1", signingKey)
      .update(signatureBaseString)
      .digest("base64");
  } else if (signatureMethod === "RSA-SHA1") {
    signature = createSign("RSA-SHA1")
      .update(signatureBaseString)
      .sign(oauth.consumer_secret, "base64");
  } else if (signatureMethod === "PLAINTEXT") {
    signature = signingKey;
  } else {
    throw new Error(`Unsupported OAuth signature_method: ${signatureMethod}`);
  }

  oauthParams.oauth_signature = signature;

  const headerValue = Object.keys(oauthParams)
    .sort()
    .map(
      (k) => `${percentEncode(k)}="${percentEncode(oauthParams[k] ?? "")}"`,
    )
    .join(", ");

  return `OAuth ${headerValue}`;
}
