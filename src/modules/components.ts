import type { BaseCtor } from "./base.js";
import type { ComponentObject, JsonResponse } from "../types.js";

export function ComponentsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class ComponentsMixin extends Base {
    listComponents(project: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/project/${project}/components` }),
        ),
      );
    }

    addNewComponent(component: ComponentObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/component" }), {
          method: "POST",
          body: component,
        }),
      );
    }

    updateComponent(
      componentId: string,
      component: ComponentObject,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/component/${componentId}` }),
          { method: "PUT", body: component },
        ),
      );
    }

    deleteComponent(
      id: string,
      moveIssuesTo?: string,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/component/${id}`,
            query: moveIssuesTo ? { moveIssuesTo } : {},
          }),
          { method: "DELETE" },
        ),
      );
    }

    relatedIssueCounts(id: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: `/component/${id}/relatedIssueCounts`,
          }),
        ),
      );
    }
  };
}
