# Release und Domainumstellung

## Stand

Der Release enthält aktuelle Mannschaften und Trainerkontakte, den lokalen Aufnahmeantrag,
Pages CMS, lokal ausgelieferte Schriften, bereinigte Navigation und Ladefehleranzeigen.
JSON-Listen werden einheitlich als `{ "items": [...] }` gespeichert, passend zu `.pages.yml`.
Vergangene Termine und Downloads mit `#` werden nicht als aktuelle Angebote angezeigt.

## Vor der Domainumstellung noch offen

- Die gewünschte Hauptdomain wurde noch nicht benannt.
- Die redaktionell verantwortliche Person in `content/impressum.html` fehlt noch.
- Der Verein muss Impressum und den auf GitHub Pages angepassten Datenschutztext bestätigen.
  Die Vorstandsnamen und VR 1072 wurden aus den offiziellen Vereinsseiten übernommen:
  [Vorstand](https://www.sv-trelde-kakenstorf.de/vorstand),
  [Impressum](https://www.sv-trelde-kakenstorf.de/impressum).
- Ein vollständiger Redakteurstest mit eingeladener E-Mail-Adresse steht aus:
  Anmeldung, bestehende News öffnen, Teständerung speichern, Live-Ergebnis prüfen und zurücknehmen.
  Die lokale Prüfung bestätigt Schema und Website, nicht die Berechtigungen des externen Kontos.

## Prüfen

```powershell
node scripts/check-release.cjs
node scripts/check-release.cjs --final
python -m http.server 8080
```

`--final` blockiert, solange Platzhalter im Impressum verbleiben.
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
GitHub-Pages-Einstellungen und DNS wurden für diesen vorbereiteten Release noch nicht geändert.
