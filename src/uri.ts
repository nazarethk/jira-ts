import type { Query, UriOptions } from "./types.js";

export interface UriContext {
  protocol: string;
  host: string;
  port: string | null;
  base: string;
  apiVersion: string;
  intermediatePath?: string;
  webhookVersion: string;
  greenhopperVersion: string;
}

function formatUrl(
  ctx: UriContext,
  tempPath: string,
  pathname: string,
  query?: Query,
  encode = false,
): string {
  const host = ctx.port ? `${ctx.host}:${ctx.port}` : ctx.host;
  let url = `${ctx.protocol}://${host}${ctx.base}${tempPath}${pathname}`;
  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) params.append(k, String(item));
      } else {
        params.append(k, String(v));
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return encode ? encodeURI(url) : decodeURIComponent(url);
}

export function makeUri(ctx: UriContext, options: UriOptions): string {
  const intermediateToUse = ctx.intermediatePath || options.intermediatePath;
  const tempPath = intermediateToUse || `/rest/api/${ctx.apiVersion}`;
  return formatUrl(
    ctx,
    tempPath,
    options.pathname,
    options.query,
    options.encode ?? false,
  );
}

export function makeWebhookUri(ctx: UriContext, options: UriOptions): string {
  const intermediateToUse = ctx.intermediatePath || options.intermediatePath;
  const tempPath =
    intermediateToUse || `/rest/webhooks/${ctx.webhookVersion}`;
  return formatUrl(ctx, tempPath, options.pathname, options.query);
}

export function makeSprintQueryUri(
  ctx: UriContext,
  options: UriOptions,
): string {
  const intermediateToUse = ctx.intermediatePath || options.intermediatePath;
  const tempPath =
    intermediateToUse ||
    `/rest/greenhopper/${ctx.greenhopperVersion}`;
  return formatUrl(ctx, tempPath, options.pathname, options.query);
}

export function makeDevStatusUri(
  ctx: UriContext,
  options: UriOptions,
): string {
  const intermediateToUse = ctx.intermediatePath || options.intermediatePath;
  const tempPath = intermediateToUse || `/rest/dev-status/latest/issue`;
  return formatUrl(ctx, tempPath, options.pathname, options.query);
}

export function makeAgileUri(ctx: UriContext, options: UriOptions): string {
  const intermediateToUse = ctx.intermediatePath || options.intermediatePath;
  const tempPath = intermediateToUse || `/rest/agile/1.0`;
  return formatUrl(ctx, tempPath, options.pathname, options.query);
}
