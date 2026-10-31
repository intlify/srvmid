# Contributing Guide

- [Contributing Guide](#contributing-guide)
  - [Issue Reporting Guidelines](#issue-reporting-guidelines)
  - [Pull Request Guidelines](#pull-request-guidelines)
    - [Work Step Example](#work-step-example)
  - [Development Setup](#development-setup)
    - [Commonly used NPM scripts](#commonly-used-npm-scripts)

## Issue Reporting Guidelines

- The issue list of this repo is **exclusively** for bug reports and feature requests. Non-conforming issues will be closed immediately.

- Try to search for your issue, it may have already been answered or even fixed in the main branch.

- Check if the issue is reproducible with the latest stable version of `srvmid`. If you are using a pre-release, please indicate the specific version you are using.

- It is **required** that you clearly describe the steps necessary to reproduce the issue you are running into. Issues with no clear repro steps will not be triaged. If an issue labeled `status: need more repro codes or info` receives no further input from the issue author for more than 5 days, it will be closed.

- For bugs that involves build setups, you can create a reproduction repository with steps in the README.

- If your issue is resolved but still open, don’t hesitate to close it. In case you found a solution by yourself, it could be helpful to explain how you fixed it.

## Pull Request Guidelines

- Checkout a topic branch from the `main` branch.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before merging.

- If adding new feature:
  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it greenlighted before working on it.

- If fixing a bug:
  - Provide detailed description of the bug in the PR.

### Work Step Example

- Create your topic branch from `master`: `git branch my-new-topic origin/main`
- Add codes and pass lint!
- Commit your changes: `git commit -am 'Add some topic'`
- Push to the branch: `git push origin my-new-topic`
- Submit a pull request to `main` branch of `intlify/srvmid` repository !

## Development Setup

This project uses [Vite+](https://viteplus.dev) to format, lint, type-check, test, and build the code. The scripts run the `vp` command from the `vite-plus` package, so you do not need to install the Vite+ CLI globally.

Requirements:

- Node.js `^22.18.0 || ^24.11.0 || >=26.0.0` (`^22.22.1` or later on Node.js 22 to run the pre-commit hook)
- Git `>=2.32.0`

After cloning the repo, run:

```sh
pnpm install
```

`pnpm install` also sets up the pre-commit hook, which runs `vp check --fix` on the staged files.

If you cloned the repo before it switched to Vite+, reset the Git hooks path once, and then install again:

```sh
git config --unset core.hooksPath
pnpm install
```

### Commonly used NPM scripts

```sh
# check formatting, lint, and types, and find unused files and dependencies
pnpm lint

# fix formatting and lint issues
pnpm fix

# run the unit tests and the type tests
pnpm test

# build the packages, and then run the e2e tests
pnpm build
pnpm e2e
```

There are some other scripts available in the `scripts` section of the `package.json` file. If you have installed the [Vite+ CLI](https://viteplus.dev/guide/), you can also run them with `vpr <script>` (for example, `vpr lint`).

**Please make sure to have this pass successfully before submitting a PR.** Although the lint will be run against your PR on the CI server, it is better to have it working locally beforehand.
