// Formulare für Arbeitsschritte, Unterpunkte, ToDos, Meilensteine und Termine.
// Werden vom Zeitstrahl, der ToDo-Seite und dem Gantt benutzt. fertig() wird nach erfolgreichem Speichern oder Löschen aufgerufen.

import { formularFenster } from '../ui/formular.js';
import { speichere, loesche, STATUS, FARBEN, TERMIN_ARTEN, WIEDERHOLUNG } from '../daten.js';
import { naechsteReihenfolge, sortiereSchritte, sortiereUnterpunkte } from '../rechnen.js';

// Beim Ändern gehen id und geaendert_am mit (Schutz vor Überschreiben im Skript)
function mitKennung(alt, daten) {
    return alt ? { ...daten, id: alt.id, geaendert_am: alt.geaendert_am } : daten;
}

export function schrittFormular(stand, alt, fertig) {
    const felder = [
        { name: 'titel', titel: 'Titel', pflicht: true, max: 120 },
        { name: 'farbe', titel: 'Farbe', art: 'farbe', werte: FARBEN },
        { name: 'start', titel: 'Start', art: 'datum' },
        { name: 'ende', titel: 'Ende', art: 'datum' },
        { name: 'status', titel: 'Status', art: 'wahl', pflicht: true, werte: STATUS },
        { name: 'beschreibung', titel: 'Beschreibung', art: 'lang' }
    ];
    // Neue Schritte bekommen die nächste noch nicht benutzte Farbe
    const benutzt = new Set(stand.arbeitsschritte.map((s) => s.farbe));
    const frei = (FARBEN.find((f) => !benutzt.has(f.id)) || FARBEN[0]).id;
    formularFenster(alt ? 'Arbeitsschritt bearbeiten' : 'Neuer Arbeitsschritt', felder, alt || { farbe: frei, status: 'offen' }, {
        speichern: async (d) => {
            if (!alt) d.reihenfolge = naechsteReihenfolge(stand.arbeitsschritte);
            await speichere('arbeitsschritte', mitKennung(alt, d));
            fertig();
        },
        loeschen: alt ? async () => { await loesche('arbeitsschritte', alt.id); fertig(); } : null,
        loeschenText: 'Der Arbeitsschritt „' + (alt ? alt.titel : '') + '“ wird mit allen Unterpunkten und ToDos gelöscht.'
    });
}

export function unterpunktFormular(stand, schrittId, alt, fertig) {
    const schritte = sortiereSchritte(stand.arbeitsschritte).map((s) => ({ id: s.id, titel: s.titel }));
    const felder = [
        { name: 'titel', titel: 'Titel', pflicht: true, max: 120 },
        { name: 'arbeitsschritt_id', titel: 'Gehört zu Arbeitsschritt', art: 'wahl', pflicht: true, werte: schritte },
        { name: 'start', titel: 'Start (optional)', art: 'datum' },
        { name: 'ende', titel: 'Ende (optional)', art: 'datum' },
        { name: 'status', titel: 'Status', art: 'wahl', pflicht: true, werte: STATUS },
        { name: 'beschreibung', titel: 'Beschreibung', art: 'lang' }
    ];
    formularFenster(alt ? 'Unterpunkt bearbeiten' : 'Neuer Unterpunkt', felder, alt || { arbeitsschritt_id: schrittId, status: 'offen' }, {
        speichern: async (d) => {
            if (!alt) d.reihenfolge = naechsteReihenfolge(stand.unterpunkte.filter((u) => u.arbeitsschritt_id === d.arbeitsschritt_id));
            await speichere('unterpunkte', mitKennung(alt, d));
            fertig();
        },
        loeschen: alt ? async () => { await loesche('unterpunkte', alt.id); fertig(); } : null,
        loeschenText: 'Der Unterpunkt „' + (alt ? alt.titel : '') + '“ wird mit allen ToDos gelöscht.'
    });
}

// Auswahl der Unterpunkte als „Arbeitsschritt › Unterpunkt“
function unterpunktWahl(stand) {
    const werte = [];
    sortiereSchritte(stand.arbeitsschritte).forEach((s) => {
        sortiereUnterpunkte(stand.unterpunkte.filter((u) => u.arbeitsschritt_id === s.id))
            .forEach((u) => werte.push({ id: u.id, titel: s.titel + ' › ' + u.titel }));
    });
    return werte;
}

export function todoFormular(stand, unterpunktId, alt, fertig) {
    const felder = [
        { name: 'titel', titel: 'Was ist zu tun?', pflicht: true, max: 200 },
        { name: 'unterpunkt_id', titel: 'Unterpunkt', art: 'wahl', werte: unterpunktWahl(stand), leer: 'Allgemein (ohne Unterpunkt)' },
        { name: 'wer', titel: 'Wer? (optional)', max: 200, hilfe: 'Leer = alle. Mehrere Namen mit Komma trennen.' },
        { name: 'faellig', titel: 'Fällig (optional)', art: 'datum' },
        { name: 'notiz', titel: 'Notiz', art: 'lang' }
    ];
    if (alt) felder.push({ name: 'erledigt', titel: 'Erledigt', art: 'haken' });
    formularFenster(alt ? 'ToDo bearbeiten' : 'Neues ToDo', felder, alt || { unterpunkt_id: unterpunktId || '' }, {
        speichern: async (d) => {
            await speichere('todos', mitKennung(alt, d));
            fertig();
        },
        loeschen: alt ? async () => { await loesche('todos', alt.id); fertig(); } : null,
        loeschenText: 'Das ToDo „' + (alt ? alt.titel : '') + '“ wird gelöscht.'
    });
}

export function meilensteinFormular(stand, alt, fertig) {
    const felder = [
        { name: 'titel', titel: 'Titel', pflicht: true, max: 120 },
        { name: 'datum', titel: 'Datum', art: 'datum', pflicht: true },
        { name: 'beschreibung', titel: 'Beschreibung', art: 'lang' }
    ];
    formularFenster(alt ? 'Meilenstein bearbeiten' : 'Neuer Meilenstein', felder, alt || {}, {
        speichern: async (d) => {
            await speichere('meilensteine', mitKennung(alt, d));
            fertig();
        },
        loeschen: alt ? async () => { await loesche('meilensteine', alt.id); fertig(); } : null,
        loeschenText: 'Der Meilenstein „' + (alt ? alt.titel : '') + '“ wird gelöscht.'
    });
}

// Termine: Gruppentreffen (meist wöchentlich), Interviews, einzelne Termine, freie Zeiten.
// vorgabe: Werte für einen neuen Termin (zum Beispiel { art: 'treffen' }).
export function terminFormular(stand, alt, fertig, vorgabe = {}) {
    const felder = [
        { name: 'titel', titel: 'Titel', pflicht: true, max: 120 },
        { name: 'art', titel: 'Art', art: 'wahl', pflicht: true, werte: TERMIN_ARTEN },
        { name: 'datum', titel: 'Datum (bei „Jede Woche“: erster Termin)', art: 'datum', pflicht: true },
        { name: 'uhrzeit', titel: 'Uhrzeit (optional)', max: 20, platzhalter: 'z. B. 18:00' },
        { name: 'ende', titel: 'Bis Datum (optional, bei mehreren Tagen)', art: 'datum' },
        { name: 'wiederholung', titel: 'Wiederholung', art: 'wahl', pflicht: true, werte: WIEDERHOLUNG },
        { name: 'bis', titel: 'Wiederholen bis (optional)', art: 'datum', hilfe: 'Leer = bis zum Ende des Zeitplans. In freien Zeiten (Ferien) fällt der Termin aus.' },
        { name: 'ort', titel: 'Ort (optional)', max: 200 },
        { name: 'organisation', titel: 'Organisation (optional)', max: 200 },
        { name: 'personen', titel: 'Personen (optional)', max: 500, hilfe: 'Nur nach Anmeldung sichtbar. Steht nur im Sheet der Gruppe.' },
        { name: 'notiz', titel: 'Notiz', art: 'lang' }
    ];
    formularFenster(alt ? 'Termin bearbeiten' : 'Neuer Termin', felder, alt || { art: 'termin', wiederholung: 'einmalig', ...vorgabe }, {
        speichern: async (d) => {
            if (d.ende && d.ende < d.datum) throw new Error('„Bis Datum“ liegt vor dem Datum.');
            if (d.bis && d.bis < d.datum) throw new Error('„Wiederholen bis“ liegt vor dem Datum.');
            await speichere('termine', mitKennung(alt, d));
            fertig();
        },
        loeschen: alt ? async () => { await loesche('termine', alt.id); fertig(); } : null,
        loeschenText: 'Der Termin „' + (alt ? alt.titel : '') + '“ wird gelöscht' + (alt && alt.wiederholung === 'woechentlich' ? ' (alle Wochen).' : '.')
    });
}
