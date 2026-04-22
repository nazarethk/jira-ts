import type { ReadStream } from "node:fs";

export interface OAuth {
  consumer_key: string;
  consumer_secret: string;
  access_token: string;
  access_token_secret: string;
  signature_method?: "RSA-SHA1" | "HMAC-SHA1" | "PLAINTEXT";
}

export type JsonResponse = Record<string, any>;

export interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  json?: boolean;
  formData?: FormData;
  timeout?: number;
  dispatcher?: unknown;
}

export type RequestFunction = (url: string, init: RequestInit) => Promise<any>;

export interface JiraApiOptions {
  protocol?: string;
  host: string;
  port?: string;
  username?: string;
  password?: string;
  apiVersion?: string;
  base?: string;
  intermediatePath?: string;
  strictSSL?: boolean;
  request?: RequestFunction;
  timeout?: number;
  webhookVersion?: string;
  greenhopperVersion?: string;
  bearer?: string;
  oauth?: OAuth;
  ca?: string | Buffer;
}

export interface HttpError {
  body: unknown;
  headers: Record<string, string>;
  statusCode: number;
  retryAfter?: number;
}

export interface UriOptions {
  pathname: string;
  query?: Query;
  intermediatePath?: string;
  encode?: boolean;
}

export interface Query {
  [name: string]: any;
}

export interface LinkObject {
  [name: string]: any;
}
export interface UserObject {
  [name: string]: any;
}
export interface IssueObject {
  [name: string]: any;
}
export interface ComponentObject {
  [name: string]: any;
}
export interface FieldObject {
  [name: string]: any;
}
export interface FieldOptionObject {
  [name: string]: any;
}
export interface TransitionObject {
  [name: string]: any;
}
export interface WorklogObject {
  comment?: string | AdfDocument;
  timeSpent?: string;
  timeSpentSeconds?: number;
  started?: string;
  visibility?: { type: string; value: string };
  [name: string]: any;
}
export interface EstimateObject {
  [name: string]: any;
}
export interface WebhookObject {
  [name: string]: any;
}
export interface NotificationObject {
  [name: string]: any;
}
export interface AttachmentObject {
  id: string;
  filename: string;
  [name: string]: any;
}
export interface ProjectObject {
  [name: string]: any;
}
export interface VersionObject {
  id?: string;
  [name: string]: any;
}
export interface CommentAdvancedObject {
  body?: string | AdfDocument;
  visibility?: { type: string; value: string };
  [name: string]: any;
}
export interface CommentOptions {
  [name: string]: any;
}
export interface WorklogOptions {
  [name: string]: any;
}

export interface BoardObject {
  type: "scrum" | "kanban";
  name: string;
  filterId: string;
}

export interface CreateIssueMetadataObject {
  projectIds?: string[];
  projectKeys?: string[];
  issuetypeIds?: string[];
  issuetypeNames?: string[];
  expand?: string;
}

export interface SearchUserOptions {
  username?: string;
  query: string;
  startAt?: number;
  maxResults?: number;
  includeActive?: boolean;
  includeInactive?: boolean;
}

export interface SearchQuery {
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
  nextPageToken?: string;
  [name: string]: any;
}

export interface AdfText {
  type: "text";
  text: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

export interface AdfParagraph {
  type: "paragraph";
  content: AdfText[];
}

export interface AdfDocument {
  type: "doc";
  version: 1;
  content: AdfParagraph[];
}

export interface SearchProjectsResponse {
  self?: string;
  nextPage?: string;
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JsonResponse[];
}

export interface CreateMetaIssueType {
  self: string;
  id: string;
  description?: string;
  iconUrl?: string;
  name: string;
  subtask?: boolean;
  hierarchyLevel?: number;
  [name: string]: any;
}

export interface CreateMetaIssueTypeField {
  required: boolean;
  schema: JsonResponse;
  name: string;
  fieldId: string;
  operations: string[];
  allowedValues?: JsonResponse[];
  [name: string]: any;
}

export interface BulkCreateIssuesPayload {
  issueUpdates: JsonResponse[];
}

export interface BulkFetchIssuesPayload {
  expand?: string[];
  fields?: string[];
  fieldsByKeys?: boolean;
  issueIdsOrKeys: string[];
  properties?: string[];
}

export interface ArchiveIssuesPayload {
  issueIdsOrKeys: string[];
}

export interface RemoveAndSwapVersionBody {
  moveFixIssuesTo?: string;
  moveAffectedIssuesTo?: string;
  customFieldReplacementList?: Array<{
    customFieldId: number;
    moveTo?: string;
  }>;
}

export interface ParseJqlPayload {
  queries: string[];
}

export interface ApproximateCountPayload {
  jql: string;
}

export type ReadStreamLike = ReadStream;
