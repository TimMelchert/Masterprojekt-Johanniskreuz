// Daten für Arbeitsschritte, Unterpunkte, ToDos, Meilensteine und Termine (Etappe 1).
// Lädt alles mit einer Anfrage und hält es nur im Arbeitsspeicher, solange die Seite offen ist
// (nie im Gerät oder im Service Worker, docs/STAND.md 1.5). Nach jedem Speichern wird der Stand hier angepasst.

import { api } from './api.js';

export const BLAETTER = ['arbeitsschritte', 'unterpunkte', 'todos', 'meilensteine', 'termine'];

export const STATUS = [
    { id: 'offen', titel: 'Offen' },
    { id: 'in_arbeit', titel: 'In Arbeit' },
    { id: 'erledigt', titel: 'Erledigt' }
];

// Farben der Arbeitsschritte. Werte in css/base.css (--schritt-<id>). Gleiche Liste wie FARBEN_ im Skript.
export const FARBEN = [
    { id: 'gruen', titel: 'Grün' },
    { id: 'blau', titel: 'Blau' },
    { id: 'orange', titel: 'Orange' },
    { id: 'gelb', titel: 'Gelb' },
    { id: 'rosa', titel: 'Rosa' },
    { id: 'lila', titel: 'Lila' },
    { id: 'tuerkis', titel: 'Türkis' },
    { id: 'grau', titel: 'Grau' }
];

// Arten von Terminen (gleiche Liste wie TERMIN_ARTEN_ im Skript). Farben in css/components.css (Abschnitt 9).
export const TERMIN_ARTEN = [
    { id: 'termin', titel: 'Termin' },
    { id: 'treffen', titel: 'Gruppentreffen' },
    { id: 'interview', titel: 'Interview' },
    { id: 'frei', titel: 'Frei / Ferien' }
];

export const WIEDERHOLUNG = [
    { id: 'einmalig', titel: 'Einmalig' },
    { id: 'woechentlich', titel: 'Jede Woche' }
];

let stand = null;      // { arbeitsschritte: [], unterpunkte: [], todos: [], meilensteine: [], termine: [] }
let laeuft = null;     // laufende Anfrage, damit zwei Ansichten nicht doppelt laden

// Gibt den Stand zurück; lädt beim ersten Mal (oder mit neu = true) vom Skript.
export async function ladeDaten(neu = false) {
    if (stand && !neu) return stand;
    if (!laeuft) {
        laeuft = api('liste')
            .then((d) => {
                stand = {};
                BLAETTER.forEach((b) => { stand[b] = Array.isArray(d[b]) ? d[b] : []; });
                return stand;
            })
            .finally(() => { laeuft = null; });
    }
    return laeuft;
}

// Vergisst den Stand (zum Beispiel beim Abmelden).
export function vergessen() {
    stand = null;
}

function ersetze(blatt, eintrag) {
    if (!stand) return;
    const liste = stand[blatt];
    const i = liste.findIndex((x) => x.id === eintrag.id);
    if (i >= 0) liste[i] = eintrag;
    else liste.push(eintrag);
}

// Neu (ohne id) oder ändern (mit id und geaendert_am). Gibt den gespeicherten Eintrag zurück.
export async function speichere(blatt, daten) {
    const d = await api('speichern', { blatt, daten });
    ersetze(blatt, d.eintrag);
    return d.eintrag;
}

// ToDo abhaken (wert = true) oder zurücknehmen.
export async function hake(id, wert) {
    const d = await api('abhaken', { id, wert: wert === true });
    ersetze('todos', d.eintrag);
    return d.eintrag;
}

// Weich löschen. Beim Arbeitsschritt verschwinden auch Unterpunkte und ToDos, beim Unterpunkt seine ToDos.
export async function loesche(blatt, id) {
    const d = await api('loeschen', { blatt, id });
    if (stand && d.geloescht) {
        Object.keys(d.geloescht).forEach((b) => {
            const weg = new Set(d.geloescht[b] || []);
            if (stand[b]) stand[b] = stand[b].filter((x) => !weg.has(x.id));
        });
    }
    return d;
}
