import { BaseClient } from "./modules/base.js";
import { IssuesMixin } from "./modules/issues.js";
import { CommentsMixin } from "./modules/comments.js";
import { WorklogsMixin } from "./modules/worklogs.js";
import { AttachmentsMixin } from "./modules/attachments.js";
import { WatchersMixin } from "./modules/watchers.js";
import { LinksMixin } from "./modules/links.js";
import { ProjectsMixin } from "./modules/projects.js";
import { VersionsMixin } from "./modules/versions.js";
import { ComponentsMixin } from "./modules/components.js";
import { UsersMixin } from "./modules/users.js";
import { FieldsMixin } from "./modules/fields.js";
import { BoardsMixin } from "./modules/boards.js";
import { SprintsMixin } from "./modules/sprints.js";
import { EpicsMixin } from "./modules/epics.js";
import { WebhooksMixin } from "./modules/webhooks.js";
import { DevStatusMixin } from "./modules/devstatus.js";
import { JqlMixin } from "./modules/jql.js";
import { MiscMixin } from "./modules/misc.js";

const Composed = MiscMixin(
  JqlMixin(
    DevStatusMixin(
      WebhooksMixin(
        EpicsMixin(
          SprintsMixin(
            BoardsMixin(
              FieldsMixin(
                UsersMixin(
                  ComponentsMixin(
                    VersionsMixin(
                      ProjectsMixin(
                        LinksMixin(
                          WatchersMixin(
                            AttachmentsMixin(
                              WorklogsMixin(
                                CommentsMixin(IssuesMixin(BaseClient)),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);

export class JiraApi extends Composed {}
