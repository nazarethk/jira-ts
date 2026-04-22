# jira-ts

[![npm version](https://img.shields.io/npm/v/jira-ts.svg)](https://www.npmjs.com/package/jira-ts)
[![npm downloads](https://img.shields.io/npm/dm/jira-ts.svg)](https://www.npmjs.com/package/jira-ts)
[![Node.js](https://img.shields.io/node/v/jira-ts.svg)](https://nodejs.org)
[![CI](https://github.com/nazarethk/jira-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/nazarethk/jira-ts/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Modern TypeScript client for the Jira Cloud REST API (v2 + v3).

- ESM-only, `NodeNext` module resolution, ships its own `.d.ts`
- No runtime deps except `undici` (for TLS/CA options on native fetch)
- Supports basic auth, bearer tokens, and OAuth 1.0a (HMAC-SHA1 / RSA-SHA1 / PLAINTEXT)
- Mirrors the API surface of the legacy `jira-client` / `@nazarethk7/jira-client`, with v3-specific additions
- Auto-wraps string comment bodies as ADF (Atlassian Document Format) when `apiVersion: '3'`

## Install

```sh
npm install jira-ts
```

Requires Node 22+.

## Quick start

```ts
import JiraApi from "jira-ts";

const jira = new JiraApi({
  protocol: "https",
  host: "your-instance.atlassian.net",
  username: process.env.JIRA_USER,
  password: process.env.JIRA_TOKEN, // Cloud API token
  apiVersion: "3", // recommended for new code; defaults to "2"
});

const issue = await jira.findIssue("PROJ-123");
const results = await jira.searchJira("project = PROJ AND status = Open");
await jira.addComment("PROJ-123", "Hello world");
```

## v2 vs v3

Default `apiVersion` is `"2"` for drop-in compatibility. Switch to `"3"` for:

- **ADF auto-wrap**: `addComment`, `updateComment`, and `addWorklog` automatically wrap a plain-string body as an Atlassian Document Format document. v2 leaves strings as-is.
- **`deleteVersion`**: under v3 it calls `POST /version/{id}/removeAndSwap` (the v3 replacement for the deprecated `DELETE /version/{id}`).

You can always bypass the auto-wrap by calling `addCommentAdvanced(issueId, { body: adfDoc })` with your own ADF.

## Auth

```ts
// Basic auth (Cloud: username + API token)
new JiraApi({ host, username, password });

// Bearer / Personal Access Token
new JiraApi({ host, bearer: "..." });

// OAuth 1.0a
new JiraApi({
  host,
  oauth: {
    consumer_key: "...",
    consumer_secret: "...", // RSA private key for RSA-SHA1
    access_token: "...",
    access_token_secret: "...",
    signature_method: "RSA-SHA1", // or HMAC-SHA1 / PLAINTEXT
  },
});
```

## New v3 methods

- `searchProjects(opts)` — paginated `/project/search` (replaces `listProjects`)
- `getCreateMetaIssueTypes(projectIdOrKey, startAt?, maxResults?)` — replaces `getIssueCreateMetadata`
- `getCreateMetaIssueTypeFields(projectIdOrKey, issueTypeId, startAt?, maxResults?)`
- `removeAndSwapVersion(versionId, body)` — v3 version removal
- `bulkCreateIssues(payload)` — `POST /issue/bulk`
- `bulkFetchIssues(payload)` — `POST /issue/bulkfetch`
- `archiveIssues(payload)` — `PUT /issue/archive`
- `parseJql(queries, validation?)` — `POST /jql/parse`
- `approximateIssueCount(jql)` — `POST /search/approximate-count`
- `searchPriorities(opts)` — paginated `/priority/search`
- `searchStatuses(opts)` — paginated `/statuses/search`

## Deprecated methods

These still work but target endpoints marked deprecated in the v3 spec. Prefer the replacements:

| Deprecated | Use instead |
|---|---|
| `listProjects()` | `searchProjects(opts)` |
| `getIssueCreateMetadata(opts)` | `getCreateMetaIssueTypes(...)` + `getCreateMetaIssueTypeFields(...)` |
| `getUsersInGroup(...)` | `getMembersOfGroup(...)` |
| `findRapidView`, `getLastSprintForRapidView`, `getSprintIssues`, `listSprints(rapidViewId)`, `getBacklogForRapidView` | The Agile-board APIs: `getAllBoards`, `getAllSprints`, `getBoardIssuesForSprint`, `getIssuesForBacklog` |

## Migrating from `@nazarethk7/jira-client`

1. `npm uninstall @nazarethk7/jira-client && npm install jira-ts`
2. Update imports: `import JiraApi from "@nazarethk7/jira-client"` → `import JiraApi from "jira-ts"`
3. If you were using custom ambient type declarations for `@nazarethk7/jira-client`, delete them — this package ships its own types.
4. If you pass a custom `request` function, note that the signature changed from `postman-request`'s callback form to `async (url, init) => body`.

Your code otherwise stays the same: the 140+ method names and their signatures are preserved.

## Testing locally

```sh
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## Credit

Inspired by the original [`jira-client`](https://www.npmjs.com/package/jira-client) by Steven Surowiec and contributors. This project is a clean-room TypeScript rewrite, not a continuation of that codebase.

## License

MIT — see [LICENSE](./LICENSE).
