# Releasing generator.handlebars

This document describes the release process for the generator.handlebars package.

## Table of Contents

- [Overview](#overview)
- [Branch Strategy (GitFlow)](#branch-strategy-gitflow)
- [Versioning](#versioning)
- [Automated Release Process](#automated-release-process)
- [Pre-release Versions](#pre-release-versions)
- [Manual Release (Emergency)](#manual-release-emergency)
- [Rollback Procedure](#rollback-procedure)
- [Branch Protection](#branch-protection)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses an automated release system based on:

- **[release-please](https://github.com/googleapis/release-please)** - Automated version bumping and changelog generation
- **[Conventional Commits](https://www.conventionalcommits.org/)** - Structured commit messages
- **GitFlow** - Branch-based development workflow
- **GitHub Actions** - CI/CD automation

## Branch Strategy (GitFlow)

```text
main (protected)
├── Release PRs auto-created by release-please
├── Hotfix branches merged here
└── Tagged releases created here

develop (protected)
├── Feature branches merged here
├── Pre-release versions published here
└── Release branches created from here

feature/* 
├── Created from: develop
├── Merged to: develop
└── Naming: feature/descriptive-name

release/*
├── Created from: develop
├── Merged to: main AND develop
└── Naming: release/X.Y.Z

hotfix/*
├── Created from: main
├── Merged to: main AND develop
└── Naming: hotfix/descriptive-name
```

### Branch Rules

| Branch       | Direct Push | Force Push | Deletion | Required Reviews |
| ------------ | ----------- | ---------- | -------- | ---------------- |
| `main`       | ❌          | ❌         | ❌       | 1                |
| `develop` | ❌ | ❌ | ❌ | 1 |
| `feature/*` | ✅ | ❌ | ✅ | 0 |
| `release/*` | ❌ | ❌ | ✅ | 1 |
| `hotfix/*` | ✅ | ❌ | ✅ | 0 |

## Versioning

We follow [Semantic Versioning](https://semver.org/):

```text
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
  3.0.0         - Stable release
  3.1.0         - New features (backward compatible)
  3.1.1         - Bug fixes only
  3.2.0-alpha.1 - Pre-release from develop
  3.2.0-rc.1    - Release candidate
```

### Commit Message → Version Bump

| Commit Prefix      | Example                   | Version Bump | Changelog Section |
| ------------------ | ------------------------- | ------------ | ----------------- |
| `feat:`            | `feat: add new helper`    | Minor        | Features          |
| `fix:` | `fix: correct parsing` | Patch | Bug Fixes |
| `perf:` | `perf: optimize search` | Patch | Performance |
| `docs:` | `docs: update README` | None* | Documentation |
| `refactor:` | `refactor: simplify code` | None* | Code Refactoring |
| `build:` | `build: update deps` | None* | Build System |
| `BREAKING CHANGE:` | In footer or `!` suffix | Major | Breaking Changes |

*These types don't trigger a release by themselves but are included if other changes exist.

### Breaking Changes

Indicate breaking changes in commits:

```bash
# Using exclamation mark
feat!: rename export function

# Using footer
feat: rename export function

BREAKING CHANGE: The `export` function is now named `exportFiles`.
Update your code: `export()` → `exportFiles()`
```

## Automated Release Process

### How It Works

1. **Commits to `main`** trigger release-please
2. **release-please** analyzes commits since last release
3. **If releasable changes exist:**
   - Creates/updates a "Release PR" with version bump and changelog
   - PR title: `chore: release X.Y.Z`
4. **When Release PR is merged:**
   - Creates a GitHub Release with tag `vX.Y.Z`
   - Publishes to npm automatically
   - Notifies on success/failure

### Workflow

```text
Feature Development:
  develop ← feature/my-feature (PR required)

Preparing Release:
  1. Create release branch: release/X.Y.Z from develop
  2. Make any final adjustments
  3. Merge to main (PR required)
  4. release-please creates Release PR
  5. Review and merge Release PR
  6. Automated publish to npm
  7. Merge main back to develop
```

### Release Checklist

- [ ] All tests passing on `develop`
- [ ] Documentation updated
- [ ] CHANGELOG preview looks correct (in Release PR)
- [ ] Version number is appropriate for changes
- [ ] Breaking changes are documented

## Pre-release Versions

Pre-releases are automatically published from the `develop` branch.

### How It Works

1. Push to `develop` triggers the pre-release workflow
2. Version format: `X.Y.Z-alpha.N+SHA` where:
   - `X.Y.Z` = current version from package.json
   - `N` = commit count since last tag
   - `SHA` = short commit hash
3. Published to npm with `alpha` tag

### Installing Pre-releases

```bash
# Install latest alpha
npm install generator.handlebars@alpha

# Install specific pre-release
npm install generator.handlebars@3.1.0-alpha.5+abc1234
```

### npm Tags

| Tag | Description | Command |
|-----|-------------|---------|
| `latest` | Stable release | `npm install generator.handlebars` |
| `alpha` | Development pre-release | `npm install generator.handlebars@alpha` |
| `beta` | Beta release (manual) | `npm install generator.handlebars@beta` |
| `next` | Next major version (manual) | `npm install generator.handlebars@next` |

## Manual Release (Emergency)

If automated release fails, you can release manually:

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Run all validations
npm run validate

# 3. Verify the version in package.json is correct
# (should have been bumped by release-please)

# 4. Create and push tag
git tag v$(node -p "require('./package.json').version")
git push origin --tags

# 5. Publish to npm
npm publish --access public

# 6. Create GitHub Release manually if needed
# Go to: https://github.com/OWNER/REPO/releases/new
```

## Rollback Procedure

### Using the Rollback Workflow

1. Go to **Actions** → **Rollback Release**
2. Click **Run workflow**
3. Fill in:
   - Version to rollback (e.g., `3.0.1`)
   - Version to rollback to (e.g., `3.0.0`)
   - Check boxes for npm/GitHub rollback
   - Enter reason
4. Click **Run workflow**

### What the Rollback Does

**npm Rollback:**

- Deprecates the bad version with a warning message
- Updates `latest` tag to point to the good version

**GitHub Rollback:**

- Deletes the GitHub Release
- Deletes the git tag

### Manual Rollback

```bash
# Deprecate npm version
npm deprecate generator.handlebars@3.0.1 "Use 3.0.0 instead. Reason: critical bug"

# Point latest to good version
npm dist-tag add generator.handlebars@3.0.0 latest

# Delete GitHub release (via UI or API)
# Delete git tag
git push --delete origin v3.0.1
```

## Branch Protection

### Setup Script

Run the branch protection setup script:

```bash
# Using environment variables
GITHUB_TOKEN=your_token GITHUB_REPOSITORY=owner/repo \
  node .github/scripts/setup-branch-protection.js

# Using arguments
GITHUB_TOKEN=your_token \
  node .github/scripts/setup-branch-protection.js owner repo
```

**Required token permissions:**

- `repo` - Full control of private repositories
- `admin:repo_hook` - For branch protection rules

### Protection Rules Applied

**main branch:**

- Require PR with 1 approval
- Require all status checks to pass
- Require linear history (no merge commits)
- Dismiss stale reviews on new commits
- Require conversation resolution
- Block force pushes and deletions

**develop branch:**

- Require PR with 1 approval
- Require lint and Node 20 tests to pass
- Allow merge commits
- Block force pushes and deletions

## Troubleshooting

### Release PR Not Created

**Symptoms:** Commits merged to main but no Release PR appears.

**Causes & Solutions:**

1. **No releasable commits**
   - Only `docs:`, `chore:`, `ci:` commits don't trigger releases
   - Add a `feat:` or `fix:` commit

2. **Workflow not triggered**
   - Check Actions tab for workflow runs
   - Ensure workflow file exists and is valid

3. **Configuration error**
   - Verify `.release-please-manifest.json` has correct version
   - Check `release-please-config.json` syntax

### npm Publish Failed

**Symptoms:** Release created but npm publish failed.

**Solutions:**

1. Check the `NPM_TOKEN` secret is set correctly
2. Verify token has publish permissions
3. Check npm registry is accessible
4. Manually publish: `npm publish --access public`

### Tests Failing in CI

**Symptoms:** PR checks failing, can't merge.

**Solutions:**

1. Run locally: `npm run validate`
2. Check specific failures in GitHub Actions logs
3. Common issues:
   - Unused variables (ESLint)
   - Formatting (Prettier)
   - Missing dependencies

### Pre-release Not Publishing

**Symptoms:** Pushes to develop don't create pre-releases.

**Solutions:**

1. Check `NPM_TOKEN` secret is available
2. Verify `develop` branch exists
3. Check workflow logs for errors
4. Manually publish: `npm publish --tag alpha`

### Rollback Failed

**Symptoms:** Rollback workflow errors.

**Solutions:**

1. Check `NPM_TOKEN` has deprecate permissions
2. Verify version numbers are correct
3. Check if versions/tags already deleted
4. Perform manual rollback (see above)

## Version Tracking

All versions are tracked in:

- [VERSION.md](./VERSION.md) - Current version and compatibility
- [CHANGELOG.md](../CHANGELOG.md) - Version history and changes
- `package.json` - npm package version

The VERSION.md file is automatically updated by release-please.

## Support

For release issues:

1. Check the troubleshooting section above
2. Search existing [GitHub Issues](https://github.com/OWNER/REPO/issues)
3. Create a new issue with the `release` label
