# Release Process

`@dougborg/mcp-printer` releases are automated with
[release-please](https://github.com/googleapis/release-please). You don't bump versions,
write changelog entries, tag, or publish by hand — conventional commits drive everything.

## How it works

1. **Land work on `master` using [Conventional Commits](https://www.conventionalcommits.org/).**
   The commit type decides the version bump and the changelog section:

   | Commit prefix              | Bump  | Changelog section |
   | -------------------------- | ----- | ----------------- |
   | `fix:`                     | patch | Bug Fixes         |
   | `feat:`                    | minor | Features          |
   | `perf:`                    | patch | Performance       |
   | `feat!:` / `BREAKING CHANGE:` footer | major | (called out) |
   | `chore:` / `docs:` / `refactor:` / `test:` / `ci:` / `build:` | none | hidden |

2. **release-please opens (and keeps updating) a release PR.** On every push to `master`,
   the `Release Please` workflow (`.github/workflows/release-please.yml`) maintains a
   `chore(main): release X.Y.Z` PR that bumps `package.json`, regenerates `CHANGELOG.md`,
   and sets the git tag it will create.

3. **Merge the release PR to ship.** Merging it makes release-please create the `vX.Y.Z`
   tag and a GitHub Release. That Release publication triggers the `Release` workflow
   (`.github/workflows/release.yml`), which builds, lints, tests, and publishes to npm with
   [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) + provenance.

## Forcing a specific version

To override the computed version (e.g. the first release of this fork), add a footer to any
commit on `master`:

```
Release-As: 2.1.0
```

release-please will set the next release PR to that version.

## First publish (one-time npm setup)

The npm package `@dougborg/mcp-printer` must exist and trust this repo before OIDC publishing
works end to end:

- Configure a **Trusted Publisher** for `@dougborg/mcp-printer` in npm
  (Settings → Packages → Publishing access), pointing at `dougborg/mcp-printer` and the
  `Release` workflow. `publishConfig.provenance` is already set in `package.json`.
- For the very first publish (before the package exists), you may need to publish once with a
  granular automation token, then switch to OIDC for all subsequent releases.

## Manual fallback

If you ever need to publish outside CI:

```bash
pnpm install --frozen-lockfile
pnpm run lint && pnpm run format:check && pnpm run build && pnpm test
npm publish --provenance --access public   # requires npm auth / trusted publishing
```

## Additional resources

- [release-please](https://github.com/googleapis/release-please-action)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers)

---

**Note:** For historical reference, [`release/RELEASE_CHECKLIST.md`](../release/RELEASE_CHECKLIST.md)
documents the manual process used for the initial upstream release.
