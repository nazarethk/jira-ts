import type { BaseCtor } from "./base.js";
import type {
  JsonResponse,
  SearchUserOptions,
  UserObject,
} from "../types.js";

export function UsersMixin<TBase extends BaseCtor>(Base: TBase) {
  return class UsersMixin extends Base {
    createUser(user: UserObject): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/user" }), {
          method: "POST",
          body: user,
        }),
      );
    }

    searchUsers({
      username,
      query,
      startAt,
      maxResults,
      includeActive,
      includeInactive,
    }: SearchUserOptions): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/user/search",
            query: {
              ...(username !== undefined ? { username } : {}),
              query,
              startAt: startAt ?? 0,
              maxResults: maxResults ?? 50,
              includeActive: includeActive ?? true,
              includeInactive: includeInactive ?? false,
            },
          }),
        ),
      );
    }

    /**
     * @deprecated Use `getMembersOfGroup` instead. `GET /group` is deprecated in the Jira v3 REST API.
     */
    getUsersInGroup(
      groupname: string,
      startAt = 0,
      maxResults = 50,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/group",
            query: {
              groupname,
              expand: `users[${startAt}:${maxResults}]`,
            },
          }),
        ),
      );
    }

    getMembersOfGroup(
      groupname: string,
      startAt = 0,
      maxResults = 50,
      includeInactiveUsers = false,
    ): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/group/member",
            query: {
              groupname,
              expand: `users[${startAt}:${maxResults}]`,
              includeInactiveUsers,
            },
          }),
        ),
      );
    }

    getUsersIssues(
      username: string,
      open?: boolean,
    ): Promise<JsonResponse> {
      const openJql = open
        ? " AND status in (Open, 'In Progress', Reopened)"
        : "";
      return (this as any).searchJira(
        `assignee = ${username.replace("@", "\\u0040")}${openJql}`,
        {},
      );
    }

    getUser(accountId: string, expand?: string): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/user",
            query: {
              accountId,
              ...(expand !== undefined ? { expand } : {}),
            },
          }),
        ),
      );
    }

    getUsers(startAt = 0, maxResults = 100): Promise<JsonResponse[]> {
      return this.doRequest(
        this.makeRequestHeader(
          this.makeUri({
            pathname: "/users",
            query: { startAt, maxResults },
          }),
        ),
      );
    }

    getCurrentUser(): Promise<JsonResponse> {
      return this.doRequest(
        this.makeRequestHeader(this.makeUri({ pathname: "/myself" })),
      );
    }
  };
}
