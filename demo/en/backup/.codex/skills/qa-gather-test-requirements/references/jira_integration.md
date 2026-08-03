# JIRA-FETCH Mode - Get Requirements from Jira

Use this mode when the user wants to fetch an issue or user story from Jira instead of pasting it manually. After the data is fetched, use it as DOC input for `qa-gather-test-requirements` and complete the full requirements analysis workflow.

## Prerequisites

- A `.env` file exists and contains the correct Jira settings. Copy `.env.example` if needed.
- Integration dependencies are installed by running `npm install` in `scripts/integrations`.

## Select the Input

| User Input | Flag |
|---|---|
| A specific issue key, for example `PROJ-123` | `--issue` |
| Project key and issue type, for example `PROJ` and `Story` | `--project --type` |
| A custom JQL query | `--jql` |
| An epic key and all child issues | `--epic` |

Choose `json` output, which is the default, or `md` output, which can be used directly as DOC input.

## Commands

```bash
# Fetch one issue
node scripts/integrations/jira/jira_fetcher.js --issue <ISSUE_KEY>

# Fetch issues by project and type
node scripts/integrations/jira/jira_fetcher.js --project <PROJECT_KEY> --type <TYPE> --max <N>

# Fetch issues with JQL
node scripts/integrations/jira/jira_fetcher.js --jql "<JQL_QUERY>"

# Export Markdown for direct use as DOC input
node scripts/integrations/jira/jira_fetcher.js --issue <KEY> --format md --output ./qa-automation/<feature-slug>
```

## Process the Result

- Check the output file in the directory given by `--output`.
- For `json`, read and summarize the issue before starting the analysis.
- For `md`, use the content directly in Step 1 of DOC mode.
- Continue the full workflow, including dependencies, comments, ambiguities, and risks. The fetch script only retrieves raw data; it does not replace analysis.

## Common Errors

| Error | Cause | Action |
|---|---|---|
| HTTP 401 | The token is invalid. | Check `JIRA_API_TOKEN` or `JIRA_PAT` in `.env`. |
| HTTP 404 | The issue does not exist or `JIRA_BASE_URL` is incorrect. | Check the issue key and base URL. |
| `.env not found` | The example file has not been copied. | Copy `.env.example` to `.env`, then add the token. |
| `Module not found` | Integration dependencies are missing. | Run `npm install` in `scripts/integrations`. |

All generated requirement content must be written in English.
