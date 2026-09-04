# Repository Guidelines

## Project Structure & Module Organization

This static SG Estetal website has no package manager, build system, or JavaScript modules. `index.html` contains page markup, CSS, and client-side rendering logic.

`content/` is the runtime data source. JSON files provide news, teams, dates, contacts, sponsors, downloads, metadata, banners, and volunteer roles; `impressum.html` and `datenschutz.html` are injected fragments. Maintain the established object shapes, especially the `teams` and `positionen` wrapper arrays. `images/` contains project-relative media, and `.pages.yml` defines Pages CMS forms. Treat `backup-old-webseite/` and `index-v1-backup.html` as reference material only.

## Build, Test, and Development Commands

There is no build or lint step. Run `node scripts/check-release.cjs` for content/schema/asset validation; `--final` also rejects unfinished legal placeholders. Serve the repository over HTTP because `index.html` loads content with `fetch()`:

```powershell
python -m http.server 8080
# Alternative, if Node is available:
npx --yes http-server -p 8080 -c-1
```

Open `http://localhost:8080/`. Manually test desktop and mobile navigation, hash routes such as `#mannschaft/<slug>` and `#artikel/<id>`, and edited JSON files without console errors.

## Coding Style & Naming Conventions

Follow the existing compact HTML/CSS/JS style in `index.html`: use two-space indentation for multiline JavaScript and preserve nearby CSS formatting. Reuse custom properties such as `--green-900` and BEM-like classes (for example, `.team-card__row`) instead of adding a framework or utility classes.

Use lowercase, hyphenated IDs and slugs (`saison-2025-26`); dates in JSON use `YYYY-MM-DD`. Store image paths as `images/file-name.jpg`, without a leading slash, so GitHub Pages project paths resolve. Fonts live in `fonts/` with their licenses; avoid introducing automatic third-party requests.

## Testing Guidelines

No coverage threshold is configured. `scripts/smoke.cjs` uses an available Playwright/Chromium installation to check desktop/mobile, navigation, contacts and load failures; see `RELEASE.md`. Capture screenshots under `.release-check/`; existing `screenshot-*.png` files are reference assets.

## Commit & Pull Request Guidelines

History uses brief, descriptive German subjects, often prefixed with `Fix CMS:` or `Mock-Banner:`. Use the same direct style, e.g. `Mannschaftsdetails: Kontaktliste ergänzen`. Keep content and implementation changes separable where practical.

PRs should explain the user-visible effect, identify changed content schemas or CMS fields, link related issues, and include desktop/mobile screenshots for UI work. Before merging `master` into `gh-pages`, compare `content/` and `admin/`: CMS edits on the deploy branch must not be overwritten.
