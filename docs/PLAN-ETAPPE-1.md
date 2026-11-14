# Plan Etappe 1: Arbeitsschritte, ToDos und Gantt (0.2.x)

Stand: 13.11.2026 · Grundlage: Wünsche der Person vom 13.11.2026. Wird am Ende der Etappe in `docs/STAND.md` eingearbeitet und gelöscht.

## Ziel

Die Gruppe sieht auf einen Blick, wo das Projekt steht: im Gantt nach Datum, im Zeitstrahl nach Arbeitsstand.
Arbeitsschritte, Unterpunkte und ToDos lassen sich in der App anlegen, bearbeiten, löschen und abhaken.

## Begriffe und Aufbau

```
Arbeitsschritt  (eigene Farbe, von – bis, Status)     z. B. „Bestandsanalyse“
 └─ Unterpunkt  (optional von – bis, Status)          z. B. „Lärm und Verkehr erfassen“
     └─ ToDo    (abhaken, optional Person und fällig)  z. B. „Zählstellen anfragen“
Meilenstein    (ein Datum, zwischen den Schritten)    z. B. „Zwischenpräsentation“
```

- **ToDos ohne Unterpunkt** sind erlaubt („allgemeine ToDos“).
- **Person** am ToDo ist freiwillig (Feld `wer`, freier Text, mehrere mit Komma). Leer = alle.
- **Erledigte ToDos** bleiben sichtbar, aber ausgegraut und durchgestrichen. Nichts verschwindet beim Abhaken.
- **Löschen** ist weich (`geloescht = TRUE` im Sheet), wie in Thetadex und AktionsDeck. Löschen eines Arbeitsschritts fragt nach und löscht seine Unterpunkte und ToDos mit.

## Seiten

### Arbeitsschritte (`#/arbeitsschritte`) – Zeitstrahl

- **Horizontal:** die Arbeitsschritte als farbige Abschnitte nebeneinander, dazwischen die Meilensteine als Raute mit Datum.
  Am Handy wischt man seitlich; der aktuelle Schritt ist beim Öffnen im Blick.
- **Zwei Pfeile ▼ über den Abschnitten:**
  - **„Plan“**: Wo wir laut Datum stehen sollten (heute liegt in diesem Arbeitsschritt, wie im Gantt).
  - **„Stand“**: Wo wir wirklich sind = der erste Arbeitsschritt, der noch nicht erledigt ist.
    Ein Schritt gilt als erledigt, wenn sein Status „erledigt“ ist oder alle seine ToDos abgehakt sind.
  Stehen beide über demselben Schritt, liegt ihr im Plan. Liegt „Stand“ links von „Plan“, seid ihr hinterher.
- **Antippen eines Abschnitts** öffnet darunter seine Unterpunkte. Jeder Unterpunkt klappt mit einem Toggler (▸/▾) seine ToDos auf.
  ToDos lassen sich direkt dort abhaken. Fortschritt je Schritt und Unterpunkt als „3/7 erledigt“.
- **Knöpfe:** „+ Arbeitsschritt“, „+ Meilenstein“, je Abschnitt „Bearbeiten“, „+ Unterpunkt“, je Unterpunkt „Bearbeiten“, „+ ToDo“.
  Löschen steckt im Bearbeiten-Formular (mit Nachfrage).

### ToDos (`#/todos`) – neue Unterseite

- Alle ToDos, gruppiert nach Arbeitsschritt und Unterpunkt (Gruppen mit Toggler), allgemeine ToDos oben.
- **Filter:** Person (aus allen Namen in `wer`), Status (offen / erledigt / alle), „nur meine“ merkt sich das Gerät nicht (keine Namen im Gerät).
- Abhaken mit großem Haken (44 px). Erledigte ausgegraut, bleiben stehen.
- „+ ToDo“ mit Formular: Titel, Unterpunkt (Auswahl, optional), Person (optional), fällig (optional), Notiz.

### Zeitplan (`#/zeitplan`) – Gantt

- Zeilen: je Arbeitsschritt ein Balken in seiner Farbe (von – bis), darunter zum Aufklappen seine Unterpunkte (mit Datum als Balken, ohne Datum nicht im Gantt).
- Meilensteine als Raute, **Heute-Linie** gestrichelt, Monats- und Wochenbeschriftung oben.
- Fortschritt im Balken (Anteil erledigter ToDos als dunklerer Teil).
- Antippen eines Balkens: Info-Fenster mit „Bearbeiten“.
- Aufbau nach `projekt-zeitplan.js` aus AktionsDeck Landau (ohne Bibliothek).

### Leiste

Start · Karten · Zeitplan · Schritte · ToDos · Akteure (am Handy sechs Einträge, Kurznamen).

## Sheet (Blätter, Zeile 1)

Alle mit `id, erstellt_am, geaendert_am, geloescht` vorne.

| Blatt | Spalten |
| --- | --- |
| `arbeitsschritte` | `titel, farbe, start, ende, status, reihenfolge, beschreibung` |
| `unterpunkte` | `arbeitsschritt_id, titel, start, ende, status, reihenfolge, beschreibung` |
| `todos` | `unterpunkt_id, titel, wer, faellig, erledigt, erledigt_am, notiz` |
| `meilensteine` | `titel, datum, beschreibung` |

- `status`: `offen`, `in_arbeit`, `erledigt`. `farbe`: Kennung aus einer festen Liste von 8 Farben (hell und dunkel lesbar), Auswahl im Formular.
- Das Blatt `aufgaben` aus 0.1 wird nicht mehr gebraucht (es ist leer). `einrichten` legt es nicht mehr an; du kannst es löschen.
- `akteure`, `beziehungen`, `einstellungen` bleiben für später. `termine` kam in 0.2.5 dazu (Wunsch der Person, siehe STAND.md 4 „Termine“).

## Skript (neue Aktionen)

- `liste` → alle vier Blätter auf einmal (ohne gelöschte).
- `speichern` (Blatt, Daten; ohne `id` = neu) mit Prüfung aller Felder, `bereinigeText_`, `LockService`, Schutz vor Überschreiben (`geaendert_am` als `bekannt`).
- `loeschen` (Blatt, id; beim Arbeitsschritt mit Unterpunkten und ToDos).
- `abhaken` (todo-id, wert) setzt `erledigt` und `erledigt_am`.

## Schritte

| Schritt | Inhalt |
| --- | --- |
| **1.1** | Sheet und Skript (Blätter, Aktionen), `js/daten.js` (Laden, Zwischenspeicher nur im Arbeitsspeicher), Fenster- und Formular-Bausteine, Leiste mit „ToDos“. |
| **1.2** | Arbeitsschritte-Seite: Zeitstrahl, Meilensteine, zwei Pfeile, Aufklappen, Formulare. |
| **1.3** | ToDos-Seite: Gruppen, Filter, Abhaken, Formular. |
| **1.4** | Zeitplan-Seite: Gantt mit Heute-Linie und Fortschritt. |
| **1.5** | Eure echten Arbeitsschritte eintragen (aus deiner Liste), Plan einarbeiten und löschen. |

## Offen

- Deine Liste der Arbeitsschritte, Unterpunkte und ToDos (für 1.5). Bis dahin teste ich mit erfundenen Beispielen, die nicht ins Sheet kommen.
