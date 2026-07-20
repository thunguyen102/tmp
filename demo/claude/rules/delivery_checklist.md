# Automation Delivery Checklist

Use this checklist before declaring automation work complete.

## Code cleanup

- Remove temporary `print()`, `console.log()`, and debug logging.
- Remove unused locators, imports, variables, and commented-out code.
- Do not leave hardcoded sleeps such as `waitForTimeout` or `Thread.sleep`.
- Keep unique identifiers and test data dynamic and traceable.

## Structure and quality

- Keep page objects, tests, utilities, and test data separated according to the project architecture.
- Define locators in page or screen objects instead of inline in tests.
- Give assertions clear failure messages and keep each test independent.
- Verify locators against the real UI rather than guessing from names or old code.

## Verification

- Run the narrowest relevant test after implementation.
- For UI automation, confirm stability with at least two consecutive successful runs when the environment permits.
- Capture screenshots on failures or meaningful milestones, not continuously.
- Record any skipped cases, known issues, environmental blockers, or limitations.

## Documentation cleanup

- Remove intermediate checkpoint .md files (keep only final status documents)
- Keep only essential documentation: test plan, locators, implementation guide, final status
- Create README.md as navigation/index for docs folder
- Run cleanup script before final delivery: `.claude/tools/cleanup-docs.js`

## Delivery

- Remove temporary files and keep outputs in the intended project directories.
- Ensure configuration and environment files contain no real credentials.
- Summarize pass, fail, and skip results and identify the implemented test cases.
- Run cleanup scripts to remove intermediate/redundant files
- Verify only essential files remain in docs folder
