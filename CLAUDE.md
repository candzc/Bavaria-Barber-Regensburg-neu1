# CLAUDE.md

## Screenshots von Referenz-Websites

Für Referenz-Websites immer ScreenshotOne statt Playwright nutzen — Playwright funktioniert in dieser Sandbox nicht für externe Seiten (siehe Vorfall vom 2026-08-22).

Aufruf:
```
curl "https://api.screenshotone.com/take?url=<ZIEL>&access_key=$SCREENSHOTONE_API_KEY&viewport_width=1440&viewport_height=900" -o referenz.png
```

Der Key muss pro Projekt neu in `.env` als `SCREENSHOTONE_API_KEY` eingetragen werden (nicht im Git gespeichert).
