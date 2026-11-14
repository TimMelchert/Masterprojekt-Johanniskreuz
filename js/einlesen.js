// Einlesen einer Datei mit vielen Einträgen auf einmal (ab 0.2.6), zum Beispiel aus dem Gantt der Gruppe.
// Die Datei liegt NICHT im Repo (sie enthält Projektdaten), sondern bei der Person oder in den Projektdateien.
// Jeder Eintrag geht einzeln über „speichern“ ans Skript, also durch dieselbe Prüfung wie ein Formular.
// Was es schon gibt (gleicher Titel an gleicher Stelle), wird übersprungen. Darum darf man die Datei auch zweimal einlesen.
//
// Aufbau der Datei (JSON):
// { "format": "johanniskreuz-einlesen-1",
//   "arbeitsschritte": [{ titel, farbe, start, ende, status, beschreibung,
//       "unterpunkte": [{ titel, start, ende, status, beschreibung, "todos": [{ titel, wer, faellig, notiz }] }] }],
//   "meilensteine": [{ titel, datum, beschreibung }],
//   "termine": [{ titel, art, datum, uhrzeit, ende, wiederholung, bis, ort, organisation, personen, notiz }],
//   "todos": [{ titel, wer, faellig, notiz }] }   ← allgemeine ToDos

import { ladeDaten, speichere } from './daten.js';
import { naechsteReihenfolge } from './rechnen.js';

export const FORMAT = 'johanniskreuz-einlesen-1';

const FELDER = {
    arbeitsschritte: ['titel', 'farbe', 'start', 'ende', 'status', 'beschreibung'],
    unterpunkte: ['titel', 'start', 'ende', 'status', 'beschreibung'],
    todos: ['titel', 'wer', 'faellig', 'notiz'],
    meilensteine: ['titel', 'datum', 'beschreibung'],
    termine: ['titel', 'art', 'datum', 'uhrzeit', 'ende', 'wiederholung', 'bis', 'ort', 'organisation', 'personen', 'notiz']
};

const gleich = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const liste = (x) => (Array.isArray(x) ? x : []);

// Nur bekannte Felder, nur Text
function nur(blatt, e) {
    const o = {};
    FELDER[blatt].forEach((k) => { if (e[k] != null && e[k] !== '') o[k] = String(e[k]); });
    return o;
}

// Liest den Text der Datei. Ergebnis: { daten, zahlen } oder Fehler mit verständlicher Meldung.
export function pruefeDatei(text) {
    let d;
    try {
        d = JSON.parse(text);
    } catch {
        throw new Error('Die Datei ist kein gültiges JSON.');
    }
    if (!d || d.format !== FORMAT) throw new Error('Die Datei hat nicht das erwartete Format („' + FORMAT + '“).');
    const schritte = liste(d.arbeitsschritte);
    const unter = schritte.flatMap((s) => liste(s.unterpunkte));
    const zahlen = {
        arbeitsschritte: schritte.length,
        unterpunkte: unter.length,
        todos: unter.reduce((n, u) => n + liste(u.todos).length, 0) + liste(d.todos).length,
        meilensteine: liste(d.meilensteine).length,
        termine: liste(d.termine).length
    };
    const ohneTitel = [...schritte, ...unter, ...unter.flatMap((u) => liste(u.todos)), ...liste(d.todos), ...liste(d.meilensteine), ...liste(d.termine)]
        .some((e) => !e || !String(e.titel || '').trim());
    if (ohneTitel) throw new Error('Mindestens ein Eintrag hat keinen Titel.');
    return { daten: d, zahlen };
}

// Übernimmt alles nacheinander. melde(text) zeigt den Fortschritt. Ergebnis: { neu, uebersprungen }.
export async function einlesen(d, melde) {
    const stand = await ladeDaten(true);
    const zaehler = { neu: 0, uebersprungen: 0 };
    const gesamt = (() => { const z = pruefeDatei(JSON.stringify(d)).zahlen; return Object.values(z).reduce((a, b) => a + b, 0); })();
    let schritt = 0;
    const weiter = (titel) => melde('Eintrag ' + (++schritt) + ' von ' + gesamt + ': ' + titel);

    async function neu(blatt, daten) {
        const e = await speichere(blatt, daten);
        zaehler.neu++;
        return e;
    }

    for (const s of liste(d.arbeitsschritte)) {
        weiter(s.titel);
        let schrittE = stand.arbeitsschritte.find((x) => gleich(x.titel, s.titel));
        if (schrittE) zaehler.uebersprungen++;
        else schrittE = await neu('arbeitsschritte', { ...nur('arbeitsschritte', s), reihenfolge: naechsteReihenfolge(stand.arbeitsschritte) });

        for (const u of liste(s.unterpunkte)) {
            weiter(u.titel);
            let uE = stand.unterpunkte.find((x) => x.arbeitsschritt_id === schrittE.id && gleich(x.titel, u.titel));
            if (uE) zaehler.uebersprungen++;
            else {
                const geschwister = stand.unterpunkte.filter((x) => x.arbeitsschritt_id === schrittE.id);
                uE = await neu('unterpunkte', { ...nur('unterpunkte', u), arbeitsschritt_id: schrittE.id, reihenfolge: naechsteReihenfolge(geschwister) });
            }
            for (const t of liste(u.todos)) {
                weiter(t.titel);
                if (stand.todos.some((x) => x.unterpunkt_id === uE.id && gleich(x.titel, t.titel))) zaehler.uebersprungen++;
                else await neu('todos', { ...nur('todos', t), unterpunkt_id: uE.id });
            }
        }
    }

    for (const t of liste(d.todos)) {
        weiter(t.titel);
        if (stand.todos.some((x) => !x.unterpunkt_id && gleich(x.titel, t.titel))) zaehler.uebersprungen++;
        else await neu('todos', { ...nur('todos', t), unterpunkt_id: '' });
    }

    for (const m of liste(d.meilensteine)) {
        weiter(m.titel);
        if (stand.meilensteine.some((x) => gleich(x.titel, m.titel) && x.datum === m.datum)) zaehler.uebersprungen++;
        else await neu('meilensteine', nur('meilensteine', m));
    }

    for (const t of liste(d.termine)) {
        weiter(t.titel);
        if (stand.termine.some((x) => gleich(x.titel, t.titel) && x.datum === t.datum)) zaehler.uebersprungen++;
        else await neu('termine', nur('termine', t));
    }

    return zaehler;
}
