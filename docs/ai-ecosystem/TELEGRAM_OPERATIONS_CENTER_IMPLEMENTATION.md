# Telegram Operations Center — Implementation Specification

**Parent authority:** `ELIMFILTERS_AI_CONSTITUTION_v1.md`  
**Status:** Approved implementation baseline  
**Purpose:** Define the secure connection between Victor's Telegram account and the ELIMFILTERS development/operations environment.

---

## 1. Objective

Provide Victor with a mobile command and notification interface while he is away from the computer, without exposing unrestricted remote shell access.

The first implementation must allow him to:

- see whether the local runner and approved services are online;
- see active and pending development tasks;
- submit a task from an approved template;
- receive progress, completion, and failure notifications;
- review a summary and changed-file list;
- approve or reject a consequential next step;
- cancel a queued or running task when supported.

---

## 2. Required deployment model

```text
Victor's Telegram app
        |
Telegram Bot API
        |
Telegram Gateway (cloud service)
        |
Authenticated HTTPS / task queue
        |
Local Runner on Victor's computer
        |
Approved repository workspace
        |
Claude Code / approved coding provider
```

### 2.1 Telegram Gateway

Recommended location: Render or another always-on service with HTTPS.

Responsibilities:

- receive Telegram updates by webhook;
- validate Telegram user ID against an allowlist;
- parse allowlisted commands;
- create task records;
- notify the local runner;
- store audit events;
- format and send responses;
- require confirmation for protected actions.

### 2.2 Local Runner

Runs on Victor's Windows computer as a background process.

Responsibilities:

- establish an outbound authenticated connection to the gateway;
- fetch only approved tasks;
- map project aliases to fixed local directories;
- invoke only approved task templates;
- capture output, exit status, timestamps, and changed files;
- redact sensitive output;
- report status and results;
- refuse unknown repositories, commands, and paths.

The local runner must not open an inbound public port on Victor's computer.

---

## 3. Initial project registry

The implementation must use fixed aliases rather than accepting arbitrary filesystem paths.

Example registry:

```json
{
  "world-catalogue": {
    "path": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue",
    "allowedBranches": ["main"],
    "provider": "claude-code"
  },
  "instagram-bot": {
    "path": "C:\\Users\\VICTOR ABREU\\Documents\\elimfilters-instagram-bot",
    "allowedBranches": ["main"],
    "provider": "claude-code"
  }
}
```

The actual registry must remain local or in protected configuration. It must not expose private local paths through Telegram responses.

---

## 4. Command set — Phase 1

### `/status`

Returns:

- Telegram gateway status;
- local runner online/offline;
- current task, if any;
- queue length;
- last successful heartbeat;
- approved provider status without exposing credentials.

### `/projects`

Returns only approved project aliases and basic state:

- available/unavailable;
- clean/modified Git working tree;
- current branch;
- last task result.

### `/tasks`

Returns queued, running, awaiting-approval, failed, and recently completed tasks.

### `/task`

Phase 1 syntax:

```text
/task <template> <project> <objective>
```

Approved initial templates:

- `inspect` — read-only repository investigation;
- `plan` — produce an implementation plan without modifying files;
- `review` — review existing changes;
- `test` — run an approved test command defined by project policy;
- `implement-docs` — create or update documentation within an approved path.

Code-changing templates are added only after approval and sandbox validation.

### `/result <task-id>`

Returns:

- objective;
- final state;
- summary;
- changed files;
- tests executed;
- warnings;
- next approval required.

### `/approve <approval-id>` and `/reject <approval-id>`

Used only for a server-generated approval request. IDs must expire and be bound to the authorized user and exact action.

### `/cancel <task-id>`

Requests cancellation. The runner must report whether cancellation succeeded.

### `/logs <service>`

Returns a short redacted tail from an approved service only. Full raw logs and environment values are prohibited.

### `/help`

Returns the current allowlisted commands and examples.

---

## 5. Security controls

### 5.1 Identity

Required environment configuration:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ALLOWED_USER_IDS`
- `GATEWAY_RUNNER_SHARED_SECRET` or asymmetric runner credentials
- `TELEGRAM_WEBHOOK_SECRET`
- database connection values

Never authenticate by Telegram username alone. Usernames can change. Use numeric Telegram user IDs.

### 5.2 No arbitrary shell

The following command must never exist:

```text
/run <raw shell command>
```

Telegram input may select only:

- a registered project;
- an approved task template;
- an objective treated as natural-language task content, never concatenated into a shell string.

All process execution must use fixed executable and argument arrays with shell mode disabled where possible.

### 5.3 Protected actions

The following require an approval record and explicit confirmation:

- committing or pushing code;
- opening or merging a pull request;
- deploying;
- publishing social content;
- sending messages to customers;
- deleting or overwriting files;
- changing dependencies;
- changing environment variables;
- database writes or migrations;
- modifying security or permission policies.

### 5.4 Fail-closed behavior

The system must refuse execution when:

- the user is not allowlisted;
- runner authentication fails;
- project alias is unknown;
- repository path does not match the registry;
- branch is not allowed;
- task template is unknown;
- approval is expired or mismatched;
- the provider proxy is unavailable;
- output redaction fails;
- audit persistence fails for a protected action.

---

## 6. Data model

Minimum tables or durable collections:

### `operators`

- id
- telegram_user_id
- display_name
- role
- active
- created_at

### `runners`

- id
- name
- machine_fingerprint
- status
- last_heartbeat_at
- current_task_id
- active

### `projects`

- id
- alias
- runner_id
- local_path_reference
- allowed_branches
- active

### `tasks`

- id
- requested_by
- project_id
- template
- objective
- state
- created_at
- started_at
- completed_at
- result_summary
- error_summary

### `approvals`

- id
- task_id
- action_type
- action_payload_hash
- requested_at
- expires_at
- decided_by
- decision
- decided_at

### `audit_events`

- id
- actor_type
- actor_id
- event_type
- target_type
- target_id
- metadata_redacted
- created_at

---

## 7. Task lifecycle

```text
requested
   |
validated
   |
queued
   |
running
   |
   +---- failed
   |
awaiting_approval (only when needed)
   |
   +---- rejected
   |
approved action
   |
completed
```

Every transition must create an audit event.

---

## 8. Local runner behavior on Windows

The local runner should be installed as one of:

1. Windows Task Scheduler job running at login and restarting on failure; or
2. Windows service after the MVP is stable.

MVP requirements:

- start automatically when Victor logs in;
- send heartbeat every 30–60 seconds;
- reconnect with exponential backoff;
- process one code task at a time initially;
- preserve task state across restarts;
- write local redacted logs;
- never store the Telegram bot token locally unless the runner itself is the gateway, which is not the recommended topology.

---

## 9. Claude Code integration

The runner must invoke Claude Code only inside the registered project directory.

Before execution it must verify:

- directory exists;
- `.git` repository matches expected remote when configured;
- current branch is allowed;
- no conflicting task is running;
- required local proxy/provider is reachable;
- task-specific policy file is available.

The runner should create a task-specific instruction file or pass a controlled prompt containing:

- project alias;
- objective;
- permitted scope;
- forbidden actions;
- required evidence;
- expected result format;
- whether writes are allowed.

Claude Code output must be summarized before being sent to Telegram. Large outputs belong in durable task artifacts, not in a single chat message.

---

## 10. MVP acceptance tests

### Authorization

- allowlisted Victor account succeeds;
- unknown account receives no project data;
- changed Telegram username does not affect numeric-ID authorization.

### Gateway

- webhook secret is validated;
- duplicate Telegram updates are idempotent;
- malformed commands do not create tasks;
- rate limits work.

### Runner

- gateway can report runner offline;
- runner reconnects after internet loss;
- unknown project is rejected;
- raw shell injection attempts are rejected;
- task cannot escape registered repository path.

### Workflow

- `/status` works from Victor's phone;
- a read-only inspection task can be queued;
- the runner executes it in `world-catalogue`;
- Victor receives start and completion notifications;
- `/result` returns a redacted summary;
- every step appears in the audit log.

---

## 11. Required manual inputs before deployment

The implementation cannot become operational until Victor supplies or creates:

1. Telegram bot token from BotFather;
2. Victor's numeric Telegram user ID;
3. hosting destination for the gateway;
4. database destination;
5. local project registry;
6. runner authentication secret or key pair;
7. approved command and task-template policy;
8. decision on whether code writes remain disabled in the first live test.

These values must be entered as environment variables or protected secrets, never pasted into repository files or committed to GitHub.

---

## 12. First live milestone

The first live milestone is intentionally limited:

```text
Victor sends /status from Telegram
        |
Gateway authenticates Victor
        |
Gateway checks local runner heartbeat
        |
Gateway returns online/offline and current task
```

The second milestone is a read-only `/task inspect world-catalogue ...` execution with result notification.

Only after these two milestones pass should the system be allowed to create or modify repository files.
