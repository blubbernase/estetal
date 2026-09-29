# Release und Domainumstellung

## Stand

Der Release enthält aktuelle Mannschaften und Trainerkontakte, den lokalen Aufnahmeantrag,
Pages CMS, lokal ausgelieferte Schriften, bereinigte Navigation und Ladefehleranzeigen.
JSON-Listen werden einheitlich als `{ "items": [...] }` gespeichert, passend zu `.pages.yml`.
Vergangene Termine und Downloads mit `#` werden nicht als aktuelle Angebote angezeigt.

## Noch offen

- Die redaktionell verantwortliche Person (`[Name]`) in `content/impressum.html` fehlt noch.
- Fünf Ansprechpartner stehen auf „Wird bekannt gegeben“: Jugendleiter, Spielausschuss Herren,
  Ehrenamtsbeauftragter, Platzwart, Webseite & Social Media. Namen nur mit Einverständnis eintragen.
- Der Verein muss Impressum und Datenschutztext bestätigen. Vorstand laut
  [Vereinsseite](https://www.sv-trelde-kakenstorf.de/vorstand), Stand 2026-09-29.
- `sg-estetal.com` gehört zum Paket der alten Agentur Mediawirbel (Sandra Ströhmer,
  kontakt@mediawirbel.de) samt alter Website. Kündigung von Website und `.com` am 2026-09-29
  per Mail angefragt; Bestätigung abwarten. Die `.de` gehört dem Verein.

## Prüfen

```powershell
python -m http.server 8080
```

`scripts/smoke.cjs` prüft Desktop/Handy, Teamkontakte, Hash-Links, Browser-Zurück,
PDF, Assets, Redaktionslink und simulierte Ladefehler. Es benötigt Playwright und Chromium;
bei vorhandener Installation können `PLAYWRIGHT_MODULE` und `CHROMIUM_PATH` gesetzt werden.
Screenshots werden nur lokal unter `.release-check/` abgelegt.

## Veröffentlichung

`main` ist der einzige Live-Branch: Code, CMS-Inhalte und Veröffentlichung liegen dort.
Vor Releases den Remote-Stand abrufen, damit CMS-Änderungen nicht überschrieben werden.
Größere technische Arbeiten in einem Arbeitsbranch vorbereiten und nach `main` mergen.
Keine Backups, CSV-Rohdaten oder lokalen Zugangsdaten veröffentlichen.

## Domain umstellen

1. Hauptdomain festlegen und in GitHub verifizieren.
2. Unter Repository → Settings → Pages die Hauptdomain eintragen. Bei Branch-Deployment
   wird dabei `CNAME` auf `main` angelegt; diese Datei in künftigen Releases erhalten.
3. Beim DNS-Anbieter für die Hauptdomain die GitHub-Pages-A-Records setzen:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   Für `www` einen CNAME auf `blubbernase.github.io` setzen (ohne `/estetal/`).
   Bestehende AAAA-Einträge prüfen; alte IPv6-Ziele würden weiterhin den alten Hoster erreichen.
   MX- und Mail-TXT-Einträge unverändert lassen.
4. Auf DNS-Prüfung/Zertifikat warten, anschließend „Enforce HTTPS“ aktivieren.
5. Hauptdomain und `www`, Teamlinks, Bilder, PDF, Impressum und Redaktion erneut prüfen.

Quelle: [GitHub-Domainanleitung](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
`sg-estetal.de` ist seit 2026-09-29 umgestellt (DNS bei IONOS, `CNAME` im Repo), HTTPS erzwungen.

## Betrieb

- **DNS** der Zone `sg-estetal.de` liegt bei IONOS und lässt sich per API ändern:
  `https://api.hosting.ionos.com/dns/v1/zones`, Header `X-API-Key`, Schlüssel als
  `IONOS_API_KEY` in der lokalen `.env` (nicht versioniert).
- Nicht anfassen: MX, SPF-TXT, DKIM- und DMARC-CNAMEs, `autodiscover` (E-Mail) sowie der
  TXT-Eintrag `google-site-verification=…` (sonst geht der Zugang zur Search Console verloren).
- **Google Search Console**: Domain-Property `sg-estetal.de`, Sitemap
  `https://sg-estetal.de/sitemap.xml` eingereicht.
- GitHub Pages cacht Dateien 10 Minuten; das ist nicht einstellbar.
- Redaktion: Einladung über Pages CMS, Anleitung als PDF in `docs/` (Quelle `docs/kurzanleitung.html`).
