# Working on SG Estetal

Follow `AGENTS.md` for conventions and `RELEASE.md` for verification and deployment.

The website is static HTML with inline CSS/JavaScript. Content comes from `content/`;
local fonts and licenses are in `fonts/`, images and the membership PDF in `images/`.
The editor is hosted Pages CMS, configured by `.pages.yml`. `admin/index.html` links
to the editorial login. Decap and Sveltia are no longer the active CMS.

The publication branch is `main`; editors save directly there. Fetch and review
those changes before releasing code so CMS edits are never overwritten.
Do not restore older CMS configurations or replace live editorial content with stale copies.
List JSON uses `{ "items": [...] }`; teams and volunteer roles retain their `teams`
and `positionen` arrays with `lastUpdated`.

Use HTTP locally (`python -m http.server 8080`). Browser checks and screenshots are
in `RELEASE.md`. Final publication depends on the open items listed there.

Never include `backup-old-webseite/`, CSV source data, credentials, or `.release-check/`
in deployments. These are local working material.
