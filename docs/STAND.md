# STAND – Projektseite Pfalzturm

**Diese Datei ist die einzige Doku-Datei für den Agenten:** Arbeitsregeln, Aufbau, aktueller Stand, Festlegungen und Pläne.
Lies sie zuerst, bei jeder Aufgabe. `CLAUDE.md` im Hauptordner zeigt nur hierher.
Für eine neue Etappe kommt ein eigener Plan dazu (`docs/PLAN-ETAPPE-<n>.md`); am Ende der Etappe wird er hier eingearbeitet und gelöscht.

- Version der App: **0.1.1** (gleich in `js/config.js` und `sw.js`: beide Dateien prüfen)
- Repo: https://github.com/TimMelchert/Masterprojekt-Johanniskreuz (öffentlich)
- Seite (App): https://timmelchert.github.io/Masterprojekt-Johanniskreuz/ (sobald GitHub Pages eingeschaltet ist)
- Laufende Etappe: **0 „Start“**. Schritt 0.1.1 liegt als Pull Request vor. Nächster Schritt: Etappe 1 „Zeitplan“ (die Person beschreibt den Zeitplan der Gruppe).

Inhalt: 1 Arbeitsregeln · 2 Aufbau · 3 Aktueller Stand und Offen · 4 Festlegungen je Bereich · 5 Technik-Merkzettel ·
6 Dateiübersicht · 7 Pläne · 8 Geschichte

Abgeleitet aus den Arbeitsregeln von Thetadex (1.3.18) und AktionsDeck Landau (1.2.2), Stand 13.11.2026.

---

## 1. Arbeitsregeln

### 1.1 Worum es geht und mit wem du arbeitest

Eine Web-App (PWA) für die Projektgruppe des Masterprojekts „Pfalzturm Johanniskreuz“ (RPTU, WiSe 2026/27, Abgabe 24.03.2027).
Sie dient der **Übersicht und Präsentation**: interaktive Karten und Pläne mit Ebenen, Zeitplan (Gantt), Zeitstrahl der Arbeitsschritte
mit Unterpunkten, Akteursnetz. Später vielleicht mehr.

**Alle Dokumente bleiben in Seafile** (Projekt-Cockpit, Interviews, Protokolle, Literatur). Die App ersetzt Seafile nicht und
schreibt nicht dorthin. Sie darf auf Seafile-Ordner verlinken.

Die Person, die mit dir arbeitet, ist keine Programmiererin und kein Programmierer. Sie arbeitet im Browser
(GitHub-Webseite, Google Sheet, Apps-Script-Editor) und in QGIS. Die Browser-Konsole ist bei ihr gesperrt: Fehler müssen in der App selbst sichtbar sein.
Sie prüft jede Änderung auf Handy und PC und übernimmt Änderungen am Google-Skript von Hand.
Die anderen Gruppenmitglieder nutzen die App nur und pflegen Daten im Google Sheet. Sie arbeiten nicht am Code.

### 1.2 Grundsätze (gelten bei jeder Entscheidung)

1. **Datenschutz zuerst.** Das Repo ist öffentlich: Darin steht nichts Persönliches und keine Projektdaten.
   Namen von Gesprächspartner:innen, Interviewtermine und Einschätzungen zu Akteuren stehen nur im Google Sheet und kommen nur mit Passwort in die App.
   Organisationen (BUND, Pfalz.Touristik, Biosphärenreservat …) dürfen genannt werden, Privatpersonen nicht.
   Keine Tracker, keine Cookies, keine fremden Dienste ohne Grund.
2. **Sicherheit immer mitdenken.** Jede neue Funktion: Wer darf das sehen? Wer darf das ändern? Was passiert mit bösen Eingaben?
3. **Effektiv statt kompliziert.** Die einfachste Lösung, die das Ziel erreicht. Bewährte Bausteine aus Thetadex und AktionsDeck
   wiederverwenden (zum Beispiel Zeitplan und Zeitachse aus AktionsDeck), bevor du neue baust.
   Wenn zwei Wege gleich gut sind: der mit weniger Code und weniger Arbeit für die Gruppe.
4. **Nichts geht verloren.** Blätter und Spalten im Sheet werden nicht umbenannt, verschoben oder gelöscht,
   solange der Plan es nicht ausdrücklich verlangt.
5. **Ausnahmen** gibt es nur, wenn die Person sie entschieden hat. Jede Ausnahme steht in Abschnitt 4 mit Grund.
   Siehst du einen Konflikt zwischen den Grundsätzen und einem Wunsch, schreibe ihn unter „Rückfragen“ und baue den sicheren Weg.

### 1.3 Sprache und Ton

- Schreibe alles auf Deutsch in einfachen Worten: Antworten, Commit-Nachrichten, Pull-Request-Texte, Kommentare im Code.
- Kurze Sätze. Keine Fachwörter ohne Erklärung (gilt auch für GIS-Begriffe wie Koordinatensystem oder WMS).
- Nenne immer Dateipfade und die Schrittnummer (zum Beispiel „1.2a“).
- Sage kurz, wo die Person klicken muss (zum Beispiel „GitHub → Settings → Pages“ oder „QGIS → Rechtsklick auf Ebene → Exportieren“).
- Stelle alle Rückfragen gesammelt am Ende deiner Antwort, nicht zwischendurch.
- Am Ende jedes Schritts steht eine Prüfliste für die Person.
- Anmerkungen zur Anzeige (Aussehen, Texte) sammelt die Person selbst und meldet sie gesammelt. Frage dazu nicht nach.

### 1.4 So arbeitest du an einer Aufgabe

1. Lies diese Datei, dann (solange es ihn gibt) den Plan der laufenden Etappe, dann genau die Dateien, die du für den Schritt brauchst.
2. Rate nie. Fehlt eine Datei, widersprechen sich Stand und Code, oder wirkt der Stand veraltet: Schreibe es klar in den
   Pull-Request-Text und arbeite nur an dem weiter, was sicher ist.
3. Prüfe zuerst `js/config.js` (VERSION) gegen den Kopf dieser Datei. Weichen sie ab, melde es.
4. Arbeite auf einem eigenen Zweig. **Ein Schritt = ein Zweig = ein Pull Request.** Nie direkt auf `main`.
5. Ändere nur, was der Schritt verlangt. Keine Aufräumaktionen nebenbei, keine Umbenennungen, kein Umformatieren.
6. Bestehende Dateien bearbeitest du gezielt, du schreibst sie nicht komplett neu.
   Ganze Dateien nur, wenn sie neu sind oder mehr als etwa die Hälfte neu ist.
7. Aktualisiere am Ende diese Datei: Version im Kopf, nächster Schritt, Abschnitt 3, bei Bedarf 4, 5, 6 und eine kurze Zeile in 8.
   Keine langen Berichte je Schritt: Einzelheiten stehen im Pull Request.
8. Prüfe deine Arbeit (1.7), dann öffne den Pull Request mit dem Text aus 1.8.

### 1.5 Harte Regeln

- **Version:** Bei jeder Änderung `VERSION` in `js/config.js` UND in `sw.js` gemeinsam hochzählen. Beide müssen am Ende exakt gleich sein.
  Vor 1.0: Etappe = mittlere Zahl (0.1.0, 0.2.0 …), Schritte und Nachbesserungen den letzten Teil (0.1.0 → 0.1.1).
  Die erste Zahl ändert sich nur, wenn die Person es sagt. Jede Nachbesserung zählt hoch, auch in einem noch offenen Pull Request.
- **Keine Projektdaten im Repo.** Aufgaben, Zeitplan, Akteure, Beziehungen, Interviews und Termine liegen nur im Google Sheet.
  Keine CSV- oder JSON-Dateien mit Projektdaten im Repo, auch nicht als Beispiel mit echten Inhalten.
- **Kartendaten im Repo** nur, wenn sie ohnehin öffentlich sind (amtliche Grenzen, Wege aus OpenStreetMap, Planungsentwürfe, die die Gruppe zeigen will).
  Ebenen mit Bezug zu Personen (zum Beispiel Orte von Gesprächen, Wohnorte, Fotos mit Personen) kommen nie ins Repo.
  Im Zweifel fragen (Rückfragen).
- **Keine Geheimnisse im Repo:** kein Passwort, keine Hashes, keine Sheet-Links, keine Seafile-Links mit Freigabe-Schlüssel.
  Das Passwort steht nur in den Skripteigenschaften (`APP_PIN`). Alles im Repo gilt als veröffentlicht.
- **Skript-Adresse:** Die Adresse des Apps Scripts steht in `js/config.js` (`API_URL`, wie bei AktionsDeck), damit die Gruppe nichts einrichten muss.
  Sie ist kein Geheimnis, weil ohne Passwort keine Daten herauskommen. `js/config.js` nie komplett neu schreiben.
- **Neue Dateien** (JS, CSS, Bilder), die zur App-Hülle gehören, trägst du in `sw.js` in die Liste `HUELLE` ein.
  Kartenebenen (GeoJSON, Kacheln) stehen **nicht** in `HUELLE`; sie werden beim Öffnen der Karte geladen.
- **Texte aus Daten nur mit `textContent`** (oder einem `el()`-Helfer mit `text:`) anzeigen. Nie `innerHTML` mit Daten.
  Das gilt auch für Pop-ups in der Karte und Beschriftungen im Netzwerk.
- **Links aus Daten** nur öffnen, wenn sie mit `https://` beginnen (`sichereUrl`).
- **Kein Build, keine Pakete, kein Framework.** Reines HTML, CSS und JavaScript mit ES-Modulen. Relative Pfade.
  Bibliotheken nur als lokale Datei in `vendor/` mit Lizenz in `LIZENZEN.md`, und nur nach Abschnitt 4. Keine externen Skripte oder Schriften.
- **Content-Security-Policy** als `<meta>` in `index.html` von Anfang an. Kein Inline-Skript, kein `style="…"` im HTML.
  Adressen nach außen nur nach Abschnitt 2.2 (Skript, Kartenkacheln, Kartendienste).
- **Farben** nur über Variablen in `css/base.css`, hell und dunkel. Die Themenfarben A bis G aus dem Projekt-Cockpit
  (Abschnitt 4 „Erscheinungsbild“) sind die einzigen Bereichsfarben und gelten überall gleich (Wand, Cockpit, App).
- **Keine Offline-Schreibzugriffe.** Schreiben geht nur mit Verbindung. Erfolg wird nur angezeigt, wenn das Skript ihn bestätigt hat.
- **Offline-Zwischenspeicher** nur für die App-Hülle und öffentliche Kartendaten. Daten aus dem Sheet nie im Service Worker
  und nicht dauerhaft im Gerät speichern (höchstens im Arbeitsspeicher, solange die Seite offen ist).
- Tippflächen am Handy mindestens 44 px hoch. Am Handy Karten statt Tabellen. Karten und Zeitplan müssen am Handy mit Fingern bedienbar sein
  (wischen, zoomen, Ebenen umschalten).

### 1.6 Google-Skript (`apps-script/*.gs`)

Ein Skript, an ein Sheet gebunden (Abschnitt 2.2). Du kannst es nicht ausführen und das Sheet nicht ändern. Das macht die Person von Hand. Darum gilt:

- Ändere `.gs`-Dateien im Repo nur, wenn der Schritt es verlangt.
- Das Skript sucht Spalten über ihre Namen in Zeile 1. Neue Spalten im Sheet müssen **vor** dem Skript da sein.
- Beim Schreiben ins Sheet läuft jeder Text durch `bereinigeText_` (Zeilenumbrüche weg, Länge begrenzt,
  führendes `=`, `+`, `-`, `@` mit Hochkomma). Jeder Schreibzugriff läuft mit `LockService`.
- **Wenn sich eine `.gs`-Datei oder das Sheet ändert, schreibst du in den Pull-Request-Text einen Abschnitt
  „Von Hand zu erledigen“** mit genau diesen Punkten, in dieser Reihenfolge:
  1. Welche Spalten oder Tabs neu angelegt werden (Namen zum Abtippen, Zeile 1, Reihenfolge).
  2. Welche `.gs`-Dateien sich geändert haben. Die Person kopiert die **ganze Datei** aus dem Repo in den
     Apps-Script-Editor (Datei im Repo öffnen → „Raw“ → alles kopieren → im Editor ersetzen).
  3. Welche Funktion im Editor einmal ausgeführt wird und was im Protokoll stehen soll.
  4. Danach: Bereitstellen → Bereitstellungen verwalten → Stift → „Neue Version“ → Bereitstellen.
     (Eine **neue Bereitstellung** mit neuer Adresse nur, wenn der Plan es verlangt; dann ändert sich `API_URL`.)
- Gibt es keine Änderung an Sheet oder Skript, schreibe ausdrücklich: „Sheet und Skript bleiben unverändert.“
- Erfahrung aus Thetadex und AktionsDeck: Kennt die App eine neue Aktion nicht („Unbekannte Aktion“), ist meist eine alte Fassung von
  `Code.gs` bereitgestellt. Dann `Code.gs` ersetzen und eine neue Version bereitstellen.

### 1.7 Prüfen vor dem Pull Request

Du hast keinen Browser auf dem Gerät der Person. Prüfe darum, was du kannst, und sage, was du nicht prüfen konntest.

1. Syntax: Für jede geänderte oder neue `.js`-Datei eine temporäre Kopie mit Endung `.mjs` anlegen und
   `node --check <datei>.mjs` ausführen. Für `.gs`-Dateien eine Kopie mit Endung `.js` prüfen. Die Kopien nicht einchecken.
2. Importe: Jeder `import`-Pfad zeigt auf eine vorhandene Datei, und jeder importierte Name wird dort auch exportiert.
3. `sw.js`: Jede Datei in `HUELLE` existiert. Jede neue JS- oder CSS-Datei steht in `HUELLE`.
4. Version: `js/config.js` und `sw.js` haben dieselbe VERSION.
5. Keine Reste: Suche nach `innerHTML`, `console.log`, `debugger`, `TODO` in deinen Änderungen.
6. Keine Geheimnisse und nichts Persönliches: Suche in deinen Änderungen nach Personennamen, Passwörtern, Sheet- und Seafile-Links.
7. GeoJSON: Jede neue Kartendatei ist gültiges JSON, liegt in WGS 84 (EPSG:4326, Längengrad zuerst) und ist kleiner als etwa 5 MB.
   Ihre Eigenschaften enthalten keine Personennamen.
8. Datenschutz und Sicherheit: Neue Daten, neue Aktionen, neue Adressen nach außen? Dann kurz im Pull Request begründen (1.2).
9. Diese Datei ist aktualisiert.
10. Bei sichtbaren Änderungen: im Testbrowser die betroffenen Seiten bei Handy- (390 px) und PC-Breite (1280 px), hell und dunkel.

### 1.8 Pull-Request-Text (immer so aufbauen)

```
## Schritt <Nummer>: <Titel>
Version: <alt> → <neu>

### Was ist neu
- (einfache Sätze)

### Geänderte Dateien
- Pfad: kurz, was sich ändert

### Datenschutz und Sicherheit
- (neue Daten, neue Rechte, neue Adressen nach außen; oder: „Keine Änderung.“)

### Sheet und Skript
Sheet und Skript bleiben unverändert.   (oder: Abschnitt „Von Hand zu erledigen“, siehe 1.6)

### Prüfen (Liste für die Person, am Handy und am PC)
1. ...

### Nicht geprüft / unsicher
- (ehrlich auflisten)

### Rückfragen
1. ...
```

Hinweis für die Person in jeder Prüfliste: Nach dem Merge etwa eine Minute warten, bis GitHub Pages fertig ist
(GitHub → Actions: grüner Haken), die Seite neu laden (bei „Neue Version da“ auf „Jetzt neu laden“ tippen),
unter „Info“ die Version prüfen.

### 1.9 Was du nicht tust

- Nicht auf `main` pushen, keinen Pull Request selbst mergen.
- Keine Dateien löschen, die der Plan nicht ausdrücklich nennt.
- Keine Daten, Passwörter oder Geheimnisse erfinden, abfragen oder einchecken.
- Keine neuen Bibliotheken ohne Festlegung in Abschnitt 4, keinen Build, keine Tracker, keine Cookies.
- Keine Funktionen bauen, die nicht im Plan stehen. Ideen schreibst du unter „Rückfragen“.
- Keine echten Personennamen oder Fotos mit Personen in Beispieldaten.
- Nicht in Seafile schreiben und keine Seafile-Zugangsdaten verlangen.

### 1.10 Prüfungen

- **Erst Bericht, dann bauen.** Eine Prüfung (Sicherheit, Datenschutz, Geschwindigkeit, Barrierefreiheit) ändert die App nicht.
  Der Bericht kommt als Datei in die Projektdateien im Chat (`webseite/pruefung/<thema>-bericht.md`), nie ins Repo. Je Fund: Ort, wie schlimm,
  wer betroffen ist, Vorschlag, Aufwand. Die Person gibt frei, was gebaut wird.
- **Maßstäbe:** Barrierefreiheit nach WCAG 2.2, Stufe AA. Die Content-Security-Policy darf keine Funktion blockieren.
- **Tests gegen das echte Skript** nur nach Absprache: wenige Anfragen, nie nach dem Passwort fragen, nichts löschen oder überschreiben.
- **Nicht vom Agenten prüfbar:** echte Ladezeiten am Handy, Freigaben in Google und GitHub, Icon auf dem echten Startbildschirm,
  Darstellung der eigenen QGIS-Stile. Das prüft die Person.

---

## 2. Aufbau

### 2.1 Oberfläche

- Statische PWA auf GitHub Pages (öffentliches Repo, kostenlos; Quelle: Zweig `main`, Ordner `/`).
  Repo-Bereiche: `index.html`, `manifest.webmanifest`, `sw.js`, `.nojekyll`, `docs/`, `icons/`, `css/` (base, layout, components),
  `js/` (app, config, api, store, ui/, views/), `vendor/` (lokale Bibliotheken), `karten/` (öffentliche Kartendaten), `apps-script/`.
- Hash-Routing: `#/` (gleich `#/start`), `#/karten`, `#/karten/<karte>`, `#/zeitplan`, `#/arbeitsschritte`, `#/akteure`, `#/info`. Unbekannte Adressen zeigen „Seite nicht gefunden“.
- Ansicht = `js/views/<name>.js` mit `render(container, ctx)`.
- Handy: Leiste unten. PC (ab 768 px): Seitenleiste links. Hell, Dunkel, Wie Gerät.
- **Anmeldung:** Ein gemeinsames Gruppenpasswort für alle Unterseiten. Nach dem ersten Anmelden merkt sich das Gerät das Passwort
  (localStorage), danach sind alle Unterseiten ohne neue Eingabe offen. Ein Knopf „Abmelden“ unter „Info“ löscht es wieder.
  **Ohne Passwort sieht man nur eine Startseite** (Projekttitel, kurzer Satz, Anmeldefeld) und „Info“ (Entscheidung 13.11.2026).
  Alles andere, auch die Karten, nur mit Passwort. Darum liefert auch die Kartendaten das Skript oder sie sind nur nach Anmeldung erreichbar (Festlegung in Etappe 2).

### 2.2 Schnittstelle, Zugang und Sicherheit

- Ein Google Apps Script als Web-App (Ausführen als Besitzer, Zugriff: Jeder), gebunden an ein neues Sheet „Pfalzturm“ im Konto der Person.
  Aufruf per POST mit JSON als `text/plain`, Feld `action`. Antwort immer JSON: bei Erfolg die Daten, bei Fehler `{error, message}`.
- **Zugang:** ein Passwort für die ganze Gruppe (mindestens 12 Zeichen) in der Skripteigenschaft `APP_PIN`.
  Jeder Aufruf schickt es mit, das Skript prüft es (`pruefePin_`). Nach 5 Fehlversuchen 15 Minuten Sperre (`CacheService`).
  Ohne Passwort liefert das Skript keine Daten; `doGet` antwortet nur mit dem Namen der Schnittstelle.
  Wechselt die Gruppe das Passwort (zum Beispiel, wenn jemand die Gruppe verlässt), müssen sich alle neu anmelden.
- **Freigabe des Sheets:** Wer das Sheet bearbeiten darf, sieht auch das Skript und das Passwort in den Skripteigenschaften.
  Das ist in der Gruppe in Ordnung (alle kennen das Passwort ohnehin). Mit niemandem außerhalb der Gruppe teilen.
- **Schutz vor Formeln und bösen Eingaben:** `bereinigeText_` und Prüfung von Art, Länge und erlaubten Werten jedes Felds.
- **Content-Security-Policy:** Skripte und Stile nur von der eigenen Seite. Verbindungen zu `https://script.google.com` und
  `https://script.googleusercontent.com`. Bilder zusätzlich von den Kartenkachel-Diensten (Festlegung in Etappe 2, zum Beispiel
  OpenStreetMap und WMS von LANIS / Geoportal RLP). Neue Adressen hier eintragen und begründen.
- Löschen ist weich (`geloescht = TRUE`).

### 2.3 Google Sheet (Tabs)

Kopfzeile in Zeile 1 (klein, ohne Umlaute). Alle Daten-Blätter haben zusätzlich `id, erstellt_am, geaendert_am, geloescht`.
Die genauen Spalten legt der Plan der jeweiligen Etappe fest. Geplant:

| Blatt | Inhalt |
| --- | --- |
| `aufgaben` | Phasen, Arbeitsschritte und Unterschritte in einer Liste (`titel, feld, wer, start, ende, status, uebergeordnet, abhaengig_von, meilenstein`). Gantt und Zeitstrahl lesen beide daraus. |
| `termine` | Gespräche und Termine (`titel, organisation, datum, uhrzeit, ort, personen`). Mit Passwort sichtbar; Namen nur in `personen`. |
| `akteure` | `name, typ, feld, einfluss, interesse, notiz` |
| `beziehungen` | `von, nach, art, staerke, quelle` |
| `einstellungen` | nur `schluessel, wert` (ohne Standardspalten): Seafile-Links je Themenfeld, Name der Kümmerer:in der Woche, sonstige Texte |

---

## 3. Aktueller Stand und Offen

### 3.1 Stand

- 0.1.0 (13.11.2026): Grundgerüst als PWA. Startseite mit Anmeldung (ein Gruppenpasswort, im Gerät gespeichert), Leiste mit Start, Karten,
  Zeitplan, Arbeitsschritte, Akteure (bis zu ihrer Etappe Platzhalter), Info mit Aussehen und Abmelden. Skript `apps-script/Code.gs`
  mit `einrichten` (legt die Blätter aus 2.3 an) und Aktion `ping`.
- 0.1.1 (13.11.2026): Skript ist bereitgestellt, `API_URL` eingetragen. Themenfelder von der Startseite entfernt (Wunsch der Person).
  Icon nach der Visualisierung des T-Lab RPTU neu gezeichnet. Link zum T-Lab unter „Info“.

### 3.2 Offen

- Repo-Name und Adresse eintragen.
- Zeitplan: Die Gruppe hat einen; die Person beschreibt ihn bei Etappe 1.

---

## 4. Festlegungen je Bereich

### Erscheinungsbild

Themenfarben genau wie die Zellfarben im Projekt-Cockpit (Tabelle „Themenfarben“), in hell und dunkel gleich, Schrift darauf `--schrift-auf-feld`:
A Raum & Ökologie `#C8E6C9` · B Recht & Planung `#BBDEFB` · C Akteure & Governance `#FFE0B2` · D Tourismus & Regionalentwicklung `#FFF59D` ·
E Turm & Alternativen `#F8BBD0` · F Theorie / kritische Landforschung `#D1C4E9` · G Organisation `#E0E0E0`.
Kopfzeile Dunkelblau `#1F3A4D` (Tabellenköpfe im Cockpit). Bereiche in der Leiste: Karten A, Zeitplan G, Arbeitsschritte D, Akteure C.
Icon: schlanke Gitterschale aus Holz mit Rautenmuster (wie der Entwurf des T-Lab RPTU) über grüner Wiese auf Dunkelblau (`icons/icon.svg`, PNGs daraus erzeugt).
Die Startseite zeigt keine Themenfelder (Entscheidung 13.11.2026); die Farben bleiben für Bereiche und spätere Inhalte.
Bilder des T-Lab (Visualisierungen) kommen nicht ins Repo, solange keine Erlaubnis da ist; die App verlinkt die Seite des T-Lab.

### Bibliotheken (Ausnahmen von „keine Fremdteile“)

- **Leaflet** (lokal in `vendor/`, ab Etappe 2): Karten mit Ebenenschalter. Grund: Eigene Kartendarstellung wäre viel mehr Code.
- **Zeitplan und Zeitstrahl:** keine Bibliothek. Aufbau nach `projekt-zeitplan.js` und `mobi-zeitstrahl.js` aus AktionsDeck Landau.
- **Akteursnetz:** `vis-network` (lokal in `vendor/`, ab Etappe 3), interaktiv (Knoten ziehen, zoomen, antippen). Entscheidung 13.11.2026.
- **Lizenzen:** Nur Bibliotheken mit freier Lizenz, die kostenlose Nutzung, Veränderung und Weitergabe erlaubt (MIT, BSD, Apache 2.0).
  Leaflet: BSD-2-Clause. vis-network: Apache 2.0 oder MIT (frei wählbar). Pflicht ist nur, den Lizenztext mitzuliefern:
  Er steht in `LIZENZEN.md` und bleibt im Kopf der Datei in `vendor/`. Kartenkacheln und Fachdaten brauchen eine Quellenangabe
  in der Karte (zum Beispiel „© OpenStreetMap-Mitwirkende“, Quelle LANIS / Geoportal RLP).

### Seafile

Die App schreibt nicht in Seafile (Entscheidung 13.11.2026). Seafile hätte eine Programmierschnittstelle, aber ein Zugangsschlüssel im Skript
dürfte die ganze Bibliothek lesen und ändern. Das Risiko ist für eine Übersichtsseite zu groß. Die App verlinkt nur auf Seafile-Ordner;
wer den Link öffnet, meldet sich dort wie gewohnt an.

### Karten (Ablauf für QGIS)

1. In QGIS arbeiten wie gewohnt (vermutlich ETRS89 / UTM 32N, EPSG:25832).
2. Jede Ebene als GeoJSON in **EPSG:4326** exportieren (Rechtsklick → Exportieren → Objekte speichern als), Koordinatengenauigkeit 6 Stellen,
   unnötige Spalten abwählen.
3. Dateien an den Agenten geben (Projektdateien im Chat). Er legt sie in `karten/<karte>/` ab und trägt sie in die Kartenbeschreibung ein.
4. Pläne als Bild: in QGIS georeferenzieren und als PNG mit Eckkoordinaten exportieren.

---

## 5. Technik-Merkzettel

- **Hilfsmodule** vor dem Neubauen suchen und wiederverwenden: `el`, `leeren`, `sichereUrl` (wie in Thetadex `js/ui/dom.js`),
  `api(action, daten)` in `js/api.js`, Zeitachse wie `mobi-zeitstrahl.js` (AktionsDeck).
- **GitHub Pages hängt** (Erfahrung aus Thetadex): Bleibt „pages build and deployment“ auf „Queued“, liegt es an GitHub. Erst „Re-run all jobs“.
- **Service Worker:** App-Dateien zwischenspeichern (`<name>-<VERSION>`, beim Installieren mit `cache: 'reload'`), Anfragen an das Skript nie aus dem Zwischenspeicher.
  Neu laden nach einem Update nur über „Jetzt neu laden“.
- **Im Gerät (localStorage):** nur Passwort (`pfalzturm_passwort`) und Wahl beim Aussehen (`pfalzturm_aussehen`). Schlüssel mit Vorsilbe `pfalzturm_`. Abmelden löscht alles.
- **Barrierefreiheit:** genau eine `h1` je Seite, jedes Feld mit Beschriftung, Fenster mit `role="dialog"`. Karten bekommen eine Textliste der Ebenen.

---

## 6. Dateiübersicht

- Hauptordner: `CLAUDE.md` (zeigt nur hierher), `README.md`, `index.html`, `manifest.webmanifest`, `sw.js`, `.nojekyll`.
  `LIZENZEN.md` kommt mit der ersten Bibliothek (Etappe 2).
- `css/`: `base.css` (Farben, hell und dunkel), `layout.css` (Kopf, Leiste unten am Handy, links am PC), `components.css` (Abschnitte 1 Grundbausteine, 2 Start, 3 Info).
- `js/`: `app.js` (Routing, Leiste, Update-Hinweis, Schutz vor fremden Rahmen), `config.js` (VERSION, `API_URL`, `features`, `BEREICHE`, `FELDER`),
  `api.js` (`api(action, daten)`, `pruefePasswort`, `ApiFehler`), `store.js` (`lesen`, `schreiben`, `abmelden`, `istAngemeldet`),
  `ui/dom.js` (`el`, `leeren`, `sichereUrl`), `ui/aussehen.js`.
- `js/views/`: `start.js` (Anmeldung bzw. Kacheln), `info.js`, `platzhalter.js`, `nichtgefunden.js`.
- `icons/`: `icon.svg`, `icon-180.png` (Apple), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.
- `apps-script/Code.gs`: das Google-Skript (Kopie; die echte Fassung liegt im Apps-Script-Editor des Sheets).
- `docs/STAND.md`: diese Datei.

---

## 7. Pläne

- **Etappe 0 „Start“ (0.1.x):** Grundgerüst als PWA, Navigation, Themenfarben, Anmeldung mit Gruppenpasswort, Apps Script mit `ping`, `einrichten` (legt die Blätter an).
- **Etappe 1 „Zeitplan“ (0.2.x):** Blatt `aufgaben`, Gantt und Zeitstrahl mit aufklappbaren Unterpunkten, Filter nach Themenfeld und Person.
- **Etappe 2 „Karten“ (0.3.x):** Leaflet, erste Karte „Standort Johanniskreuz“ mit Grundkarte, Schutzgebieten (WMS) und QGIS-Ebenen der Gruppe.
- **Etappe 3 „Akteursnetz“ (0.4.x):** Netzwerk und Einfluss-Interesse-Matrix.
- **Danach:** Startseite mit Übersicht, Präsentationsansicht für die Abgabe, weitere Ideen nach Bedarf.

---

## 8. Geschichte (kurz)

- 13.11.2026: Arbeitsregeln aus Thetadex und AktionsDeck übernommen und angepasst.
- 0.1.0 (13.11.2026): Schritt 0.1 Grundgerüst.
- 0.1.1 (13.11.2026): Skript-Adresse, Startseite ohne Themenfelder, neues Icon.
