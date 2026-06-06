# Linear GraphQL API

Implementation: `apps/server/src/services/linear.service.ts`

## Authentication

Requests are sent to:

```text
https://api.linear.app/graphql
```

The configured `LINEAR_API_KEY` is passed in the `Authorization` header.

## Implemented Operations

| Operation | GraphQL operation |
|---|---|
| Read team workflow states | `TeamStates` query |
| Create issue | `issueCreate` mutation |
| Rename/update issue | `issueUpdate` mutation |
| Update description and priority | `issueUpdate` mutation |
| Update due date | `issueUpdate` mutation |
| Update workflow state | `issueUpdate` mutation |
| Create comment | `commentCreate` mutation |
| Archive issue | `issueArchive` mutation |
| Reopen issue | `issueUnarchive` mutation |

## State Lookup

Before changing a Linear workflow state, the service fetches team states using `LINEAR_TEAM_ID` and finds a case-insensitive name match.

## Priority Values

| Name | Linear number |
|---|---:|
| No Priority | `0` |
| Urgent | `1` |
| High | `2` |
| Medium | `3` |
| Low | `4` |

## Due Dates

Incoming dates are reduced to `YYYY-MM-DD` before being sent to Linear.

## Errors

The service throws for:

- Non-success HTTP responses.
- GraphQL `errors`.
- Missing or unsuccessful mutation results.
- Missing configured workflow states.

There are currently no timeouts, retries, rate-limit handling, or shared GraphQL request abstraction.
