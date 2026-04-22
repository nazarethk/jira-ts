import type { BaseCtor } from "./base.js";
import type {
  CreateIssueMetadataObject,
  CreateMetaIssueType,
  CreateMetaIssueTypeField,
  FieldObject,
  FieldOptionObject,
  JsonResponse,
} from "../types.js";

export function FieldsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class FieldsMixin extends Base {
    createCustomField(field: FieldObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/field" }), {
          method: "POST",
          body: field,
        }),
      );
    }

    listFields(): Promise<FieldObject[]> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/field" })),
      );
    }

    createFieldOption(
      fieldKey: string,
      option: FieldOptionObject,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/field/${fieldKey}/option` }),
          { method: "POST", body: option },
        ),
      );
    }

    listFieldOptions(fieldKey: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/field/${fieldKey}/option` }),
        ),
      );
    }

    upsertFieldOption(
      fieldKey: string,
      optionId: string,
      option: FieldOptionObject,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/field/${fieldKey}/option/${optionId}`,
          }),
          { method: "PUT", body: option },
        ),
      );
    }

    getFieldOption(
      fieldKey: string,
      optionId: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/field/${fieldKey}/option/${optionId}`,
          }),
        ),
      );
    }

    deleteFieldOption(
      fieldKey: string,
      optionId: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/field/${fieldKey}/option/${optionId}`,
          }),
          { method: "DELETE" },
        ),
      );
    }

    /**
     * @deprecated Use `getCreateMetaIssueTypes` / `getCreateMetaIssueTypeFields` instead.
     * `GET /issue/createmeta` is deprecated in the Jira v3 REST API.
     */
    getIssueCreateMetadata(
      optional: CreateIssueMetadataObject = {},
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/issue/createmeta",
            query: optional as Record<string, unknown>,
          }),
        ),
      );
    }

    getCreateMetaIssueTypes(
      projectIdOrKey: string,
      startAt = 0,
      maxResults = 50,
    ): Promise<{ issueTypes: CreateMetaIssueType[]; total: number }> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/createmeta/${projectIdOrKey}/issuetypes`,
            query: { startAt, maxResults },
          }),
        ),
      );
    }

    getCreateMetaIssueTypeFields(
      projectIdOrKey: string,
      issueTypeId: string,
      startAt = 0,
      maxResults = 50,
    ): Promise<{ fields: CreateMetaIssueTypeField[]; total: number }> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/issue/createmeta/${projectIdOrKey}/issuetypes/${issueTypeId}`,
            query: { startAt, maxResults },
          }),
        ),
      );
    }
  };
}
