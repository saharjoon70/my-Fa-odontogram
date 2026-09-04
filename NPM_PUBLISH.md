# npm publish setup

This guide explains how to publish `vue-advanced-odontogram` to npm, mirroring the workflow used by the simpler [`vue-odontogram`](https://www.npmjs.com/package/vue-odontogram) package.

## Package layout

The library is built from `src/index.ts` into `dist/`:

| Output | Purpose |
|--------|---------|
| `vue-advanced-odontogram.es.js` | ESM entry |
| `vue-advanced-odontogram.cjs.js` | CommonJS entry |
| `index.d.ts` | TypeScript declarations |
| `style.css` | Required component styles |

Consumers install the package and import styles separately:

```bash
npm install vue-advanced-odontogram
```

```vue
<script setup lang="ts">
import OdontogramShell from "vue-advanced-odontogram";
import "vue-advanced-odontogram/style.css";
</script>

<template>
  <OdontogramShell language="en" numbering-system="FDI" />
</template>
```

## One-time npm setup

1. **Create an npm account** at [npmjs.com](https://www.npmjs.com/signup) if you do not already have one.
2. **Claim the package name** (first publish only):
   - If the name is free, the first `npm publish` registers it under your account.
   - For an org scope (e.g. `@your-org/vue-advanced-odontogram`), set `"name"` in `package.json` accordingly and use `"publishConfig": { "access": "public" }` for public scoped packages.
3. **Create an npm access token**:
   - npm → Account → Access Tokens → Generate New Token
   - Choose **Automation** (recommended for CI) or **Publish** for manual use.
4. **Add the token to GitHub** (for automated publishes):
   - Repository → Settings → Secrets and variables → Actions
   - New repository secret: `NPM_TOKEN` = your token value

## Local verification before publish

From the repo root:

```bash
npm ci
npm run build
npm test
npm pack --dry-run
```

`npm pack --dry-run` lists exactly which files would ship (should be only `dist/` plus `package.json` metadata).

Optional local install into another Vue app:

```bash
npm run build
npm pack
# In your host app:
npm install /path/to/vue-advanced-odontogram-2.1.0.tgz
```

Or use `npm link`:

```bash
npm run build
npm link
# In your host app:
npm link vue-advanced-odontogram
```

## Manual publish

1. Bump `version` in `package.json` (and the README version badge).
2. Add a `CHANGELOG.md` entry for the release.
3. Commit, tag, and push:

```bash
git add package.json CHANGELOG.md README.md
git commit -m "chore: release v2.1.1"
git tag v2.1.1
git push origin main --tags
```

4. **Or** publish locally (after `npm login`):

```bash
npm run build
npm test
npm publish
```

## Automated publish (GitHub Actions)

The workflow at `.github/workflows/publish.yml` runs when:

- You push a tag matching `v*` (e.g. `v2.1.1`), **or**
- You trigger **Publish Package** manually from the Actions tab (`workflow_dispatch`).

Steps performed in CI:

1. `npm ci`
2. `npm run build`
3. `npm test`
4. `npm publish` (uses `NPM_TOKEN` secret)

### Release checklist

1. Ensure `NPM_TOKEN` is configured on the GitHub repository.
2. Bump version in `package.json` and document changes in `CHANGELOG.md`.
3. Commit on `main`.
4. Create and push an annotated tag:

```bash
git tag -a v2.1.1 -m "Release v2.1.1"
git push origin v2.1.1
```

5. Watch the **Publish Package** workflow in GitHub Actions.
6. Confirm the new version on [npmjs.com/package/vue-advanced-odontogram](https://www.npmjs.com/package/vue-advanced-odontogram).

## Versioning

This project follows [Semantic Versioning](https://semver.org/). Tag names must match the package version with a `v` prefix (`package.json` `2.1.1` → tag `v2.1.1`).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `402 Payment Required` on scoped package | Set `"publishConfig": { "access": "public" }` |
| `403 Forbidden` | Token lacks publish rights, or package name owned by another user/org |
| `npm publish` ships source/tests | Confirm `"files": ["dist"]` and run `npm run build` first |
| Types missing in consumer IDE | Ensure `vite-plugin-dts` ran; check `dist/index.d.ts` exists after build |
| Styles missing in host app | Import `vue-advanced-odontogram/style.css` in the host entry |
