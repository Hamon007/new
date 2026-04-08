# Black Knot - Ermittlungszentrale (PWA)

Interaktiver Ermittlungs-/Spionage-Thriller als offlinefaehige Progressive Web App.

Aktueller Stand:
- PWA-Grundsystem mit Manifest + Service Worker
- Datengetriebener Fall 1: "Die weisse Stunde"
- Deterministische Runtime-Engine fuer:
  - Flag-Prioritaeten
  - Flag-Konfliktregeln
  - reproduzierbare Ending-Priorisierung
- Szenen-Flow mit Clue-Sicherung, Choice-Flags und Hypothesenstatus
- Fallabschluss ueber regelbasierte Ending-Resolution

## Lokaler Start

Du kannst die App direkt mit einem lokalen Webserver starten (z. B. VSCode Live Server) und `index.html` oeffnen.

## Deployment (GitHub Pages)

1. In GitHub im Repo unter `Settings -> Pages` als Source `GitHub Actions` waehlen.
2. Auf `main` pushen.
3. Workflow `.github/workflows/deploy.yml` deployed automatisch.

## Struktur

```
black-knot-pwa/
|- index.html
|- manifest.json
|- sw.js
|- src/
|  |- app.js
|  |- engine.js
|  |- data/
|     |- case1.js
|- icons/
|  |- icon-192.png
|  |- icon-512.png
|- .github/
   |- workflows/
      |- deploy.yml
```

## Naechste Schritte

1. Fall 1 auf 4 Akte ausbauen (mehr Knoten, mehr Red Herrings, Schlussbericht tiefer).
2. Datenmodell auf 12 Faelle erweitern (Fallpacks).
3. Dossier-, Audio- und Kartenmodule als eigene Views auslagern.
4. Entscheidungskosten (Zeit, Zugriff, politischer Druck) als zusaetzliche Determinismus-Variable einbauen.
