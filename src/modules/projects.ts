import type { BaseCtor } from "./base.js";
import type {
  JsonResponse,
  ProjectObject,
  SearchProjectsResponse,
} from "../types.js";

export interface SearchProjectsOptions {
  startAt?: number;
  maxResults?: number;
  orderBy?: string;
  id?: number[];
  keys?: string[];
  query?: string;
  typeKey?: string;
  categoryId?: number;
  action?: string;
  expand?: string;
  status?: string[];
  properties?: string[];
  propertyQuery?: string;
}

export function ProjectsMixin<TBase extends BaseCtor>(Base: TBase) {
  return class ProjectsMixin extends Base {
    getProject(project: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: `/project/${project}` }),
        ),
      );
    }

    createProject(project: ProjectObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/project" }), {
          method: "POST",
          body: project,
        }),
      );
    }

    /**
     * @deprecated Use `searchProjects` instead. `GET /project` is deprecated in the Jira v3 REST API
     * in favor of the paginated `GET /project/search`.
     */
    listProjects(): Promise<JsonResponse[]> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({ pathname: "/project" }),
        ),
      );
    }

    searchProjects(
      options: SearchProjectsOptions = {},
    ): Promise<SearchProjectsResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/project/search",
            query: options as Record<string, unknown>,
          }),
        ),
      );
    }

    getProjects(
      boardId: string,
      startAt = 0,
      maxResults = 50,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({
            pathname: `/board/${boardId}/project`,
            query: { startAt, maxResults },
          }),
        ),
      );
    }

    getProjectsFull(boardId: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeAgileUri({ pathname: `/board/${boardId}/project/full` }),
        ),
      );
    }
  };
}
