# Field Mappings

Mappings are currently defined in `apps/server/src/sync/sync-config.ts`.

## Core Fields

| Trello | Linear | Direction |
|---|---|---|
| Card name | Issue title | Both |
| Card description | Issue description | Both |
| Card due date | Issue due date | Both |
| Card list | Workflow state | Both |
| Card archive state | Issue archive state | Both |
| Card comment | Issue comment | Both |
| Priority conventions | Issue priority | Both, represented through Trello description/list/labels |

## Status and List Mapping

### Trello list to Linear state

| Trello list | Linear state |
|---|---|
| Wishes | Backlog |
| Buglist | Backlog |
| ToDo | Todo |
| ToDo (My Boss) | Todo |
| ToDo Prio 1 | Todo |
| ToDo Prio 2 | Todo |
| ToDo Prio 3 | Todo |
| In Progress | In Progress |
| Done | Done |

### Linear state to Trello list

| Linear state | Trello list |
|---|---|
| Backlog | Wishes |
| Todo | ToDo |
| In Progress | In Progress |
| Done | Done |

The default list for Linear issue creation is `Wishes`.

Mapping keys are normalized by lowercasing, trimming formatting markers, removing backslashes, and treating underscores and hyphens as spaces.

## Priority Mapping

Recognized tokens include:

| Tokens | Linear priority |
|---|---|
| `none`, `no priority` | No Priority |
| `urgent`, `p0`, `prio 0`, `priority 0` | Urgent |
| `high`, `p1`, `prio 1`, `priority 1` | High |
| `medium`, `p2`, `prio 2`, `priority 2` | Medium |
| `low`, `p3`, `prio 3`, `priority 3` | Low |

Priority can be read from a Trello label, a line in a description, or configured priority list names.

When Linear updates priority, Trello receives a marker at the top of its description:

```text
** High

Original description
```

## Planned Fields

- Trello labels to Linear labels.
- Trello members to Linear assignees.
- Attachments.
- Board/project-specific mappings stored outside source code.
