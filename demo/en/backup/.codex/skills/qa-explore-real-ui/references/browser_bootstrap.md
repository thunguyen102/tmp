# Browser Bootstrap Contract

Use the first route that successfully launches and controls a real browser. Validate each route with an actual page open; tool presence alone is not success.

## Route Order

1. Use an available Playwright MCP and verify navigation plus DOM interaction.
2. If MCP is absent, inspect the host's supported MCP configuration and proactively install/configure Playwright MCP. Validate it in the current run when possible.
3. If MCP installation needs a host restart, is unsupported, or fails validation, continue immediately with Playwright CLI.
4. Reuse an existing local Playwright installation when healthy.
5. Otherwise install Playwright CLI and the required browser locally. Respect the repository's package manager and lockfile. If the repository is not a Node project, use an isolated temporary working directory so exploration does not pollute it.
6. If installation or browser launch is blocked by sandbox, network, proxy, certificates, or system dependencies, request the required approval and retry. Do not ask the user to run the command.

## CLI Validation

- Confirm the package and browser executable work by opening the supplied URL.
- Prefer Chromium unless the requirement targets another browser.
- Run headless by default; use headed mode only when needed and permitted.
- Keep temporary exploration code outside product test suites unless the user asks to retain it.
- Save screenshots, trace, or logs under the feature's `evidence/` directory, not in dependency or system folders.

## Failure Standard

Do not claim tooling is unavailable before attempting applicable installation and approval paths. Record commands/routes attempted, sanitized errors, and whether the blocker is tooling, network, browser dependency, authentication, CAPTCHA, VPN, or application availability.
