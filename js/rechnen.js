// Rechenhelfer für Arbeitsschritte, Unterpunkte, ToDos, Meilensteine und Termine (ohne Anzeige).
// Wird vom Zeitstrahl (arbeitsschritte.js), der ToDo-Seite und dem Gantt benutzt.

// Heutiges Datum in Ortszeit als JJJJ-MM-TT
export function heute() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// „16.11.“ oder „16.11.2026“ (mitJahr)
export function datumKurz(iso, mitJahr = false) {
    if (!iso) return '';
    const [j, m, t] = iso.split('-');
    return Number(t) + '.' + Number(m) + '.' + (mitJahr ? j : '');
}

export function zeitraumText(start, ende) {
    if (start && ende) return datumKurz(start) + ' – ' + datumKurz(ende, true);
    if (start) return 'ab ' + datumKurz(start, true);
    if (ende) return 'bis ' + datumKurz(ende, true);
    return 'ohne Datum';
}

function zahl(v, ersatz) {
    return typeof v === 'number' && isFinite(v) ? v : ersatz;
}

// Arbeitsschritte: nach Start (ohne Start ans Ende), dann Reihenfolge, dann Titel
export function sortiereSchritte(liste) {
    return [...liste].sort((a, b) =>
        (a.start || '9999') .localeCompare(b.start || '9999') ||
        zahl(a.reihenfolge, 1e9) - zahl(b.reihenfolge, 1e9) ||
        a.titel.localeCompare(b.titel, 'de'));
}

// Unterpunkte: nach Reihenfolge (so wie angelegt), dann Start, dann Titel
export function sortiereUnterpunkte(liste) {
    return [...liste].sort((a, b) =>
        zahl(a.reihenfolge, 1e9) - zahl(b.reihenfolge, 1e9) ||
        (a.start || '9999').localeCompare(b.start || '9999') ||
        a.titel.localeCompare(b.titel, 'de'));
}

// ToDos: offene zuerst, dann nach Fälligkeit (ohne ans Ende), dann Titel
export function sortiereTodos(liste) {
    return [...liste].sort((a, b) =>
        Number(a.erledigt) - Number(b.erledigt) ||
        (a.faellig || '9999').localeCompare(b.faellig || '9999') ||
        a.titel.localeCompare(b.titel, 'de'));
}

// Nächste freie Reihenfolge-Zahl (für neue Einträge, damit sie hinten stehen)
export function naechsteReihenfolge(liste) {
    return liste.reduce((m, x) => Math.max(m, zahl(x.reihenfolge, 0)), 0) + 1;
}

export function unterpunkteVon(stand, schrittId) {
    return sortiereUnterpunkte(stand.unterpunkte.filter((u) => u.arbeitsschritt_id === schrittId));
}

export function todosVon(stand, unterpunktId) {
    return sortiereTodos(stand.todos.filter((t) => (t.unterpunkt_id || '') === (unterpunktId || '')));
}

// Fortschritt eines Arbeitsschritts: { erledigt, gesamt } über alle ToDos seiner Unterpunkte
export function fortschrittSchritt(stand, schrittId) {
    const ids = new Set(stand.unterpunkte.filter((u) => u.arbeitsschritt_id === schrittId).map((u) => u.id));
    const todos = stand.todos.filter((t) => ids.has(t.unterpunkt_id));
    return { erledigt: todos.filter((t) => t.erledigt).length, gesamt: todos.length };
}

export function fortschrittUnterpunkt(stand, unterpunktId) {
    const todos = stand.todos.filter((t) => t.unterpunkt_id === unterpunktId);
    return { erledigt: todos.filter((t) => t.erledigt).length, gesamt: todos.length };
}

// Erledigt: Status „erledigt“ oder alle ToDos abgehakt (mindestens eines)
export function schrittErledigt(stand, schritt) {
    if (schritt.status === 'erledigt') return true;
    const f = fortschrittSchritt(stand, schritt.id);
    return f.gesamt > 0 && f.erledigt === f.gesamt;
}

export function unterpunktErledigt(stand, u) {
    if (u.status === 'erledigt') return true;
    const f = fortschrittUnterpunkt(stand, u.id);
    return f.gesamt > 0 && f.erledigt === f.gesamt;
}

// Pfeil „Plan“: Index des Arbeitsschritts, in dem heute laut Datum liegt.
// Liegt heute zwischen zwei Schritten, gilt der zuletzt begonnene. -1 = noch nicht begonnen oder keine Daten.
export function planIndex(schritte, tag = heute()) {
    let index = -1;
    schritte.forEach((s, i) => {
        if (s.start && s.start <= tag) index = i;
    });
    return index;
}

// Pfeil „Stand“: Index des ersten Arbeitsschritts, der noch nicht erledigt ist. schritte.length = alles erledigt.
export function standIndex(stand, schritte) {
    const i = schritte.findIndex((s) => !schrittErledigt(stand, s));
    return i < 0 ? schritte.length : i;
}

// Kurzer Satz zum Vergleich der beiden Pfeile
export function vergleichText(plan, standI, anzahl) {
    if (!anzahl) return '';
    if (standI >= anzahl) return 'Alle Arbeitsschritte sind erledigt.';
    if (plan < 0) return 'Laut Plan hat noch kein Arbeitsschritt begonnen.';
    if (standI === plan) return 'Ihr liegt im Plan.';
    const n = Math.abs(plan - standI);
    const wort = n === 1 ? 'Arbeitsschritt' : 'Arbeitsschritte';
    return standI < plan ? 'Ihr seid ' + n + ' ' + wort + ' hinter dem Plan.' : 'Ihr seid ' + n + ' ' + wort + ' vor dem Plan.';
}

// Reihe für den Zeitstrahl: Arbeitsschritte in Reihenfolge, Meilensteine dazwischen nach Datum.
// Ein Meilenstein steht hinter dem letzten Arbeitsschritt, der vor oder an seinem Datum beginnt.
// Ergebnis: [{ art: 'schritt', schritt, index } | { art: 'meilenstein', meilenstein }]
export function zeitstrahlReihe(schritte, meilensteine) {
    const ms = [...meilensteine].sort((a, b) => a.datum.localeCompare(b.datum));
    const hinter = schritte.map(() => []);
    const vorne = [];
    ms.forEach((m) => {
        const i = planIndex(schritte, m.datum);
        // Meilenstein vor dem Ende seines Schritts gehört vor den nächsten, also hinter diesen Schritt
        if (i < 0) vorne.push(m);
        else hinter[i].push(m);
    });
    const reihe = vorne.map((m) => ({ art: 'meilenstein', meilenstein: m }));
    schritte.forEach((s, i) => {
        reihe.push({ art: 'schritt', schritt: s, index: i });
        hinter[i].forEach((m) => reihe.push({ art: 'meilenstein', meilenstein: m }));
    });
    return reihe;
}

// Alle Personen aus den ToDos (Feld „wer“, mehrere mit Komma), alphabetisch
export function personen(todos) {
    const alle = new Set();
    todos.forEach((t) => String(t.wer || '').split(',').map((x) => x.trim()).filter(Boolean).forEach((p) => alle.add(p)));
    return [...alle].sort((a, b) => a.localeCompare(b, 'de'));
}

export function istVon(todo, person) {
    return String(todo.wer || '').split(',').map((x) => x.trim().toLowerCase()).includes(person.toLowerCase());
}

// ---------- Termine ----------

const TAG_MS = 86400000;
const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

// Datum plus n Tage (JJJJ-MM-TT, in UTC gerechnet, damit die Sommerzeit nicht stört)
export function plusTage(iso, n) {
    const [j, m, t] = iso.split('-').map(Number);
    return new Date(Date.UTC(j, m - 1, t) + n * TAG_MS).toISOString().slice(0, 10);
}

export function wochentag(iso) {
    const [j, m, t] = iso.split('-').map(Number);
    return WOCHENTAGE[new Date(Date.UTC(j, m - 1, t)).getUTCDay()];
}

// Ob ein Datum in einer freien Zeit (Art „frei“, einmalig) liegt
function istFrei(frei, tag) {
    return frei.some((f) => f.datum <= tag && tag <= (f.ende || f.datum));
}

// Alle Vorkommen der Termine zwischen von und bis (beide JJJJ-MM-TT, einschließlich).
// Wöchentliche Termine werden aufgefächert (bis „bis“ oder bis zum Ende des Zeitraums), aber nicht in freien Zeiten.
// Ergebnis: [{ termin, datum, ende }] nach Datum und Uhrzeit sortiert.
export function termineZwischen(termine, von, bis) {
    const frei = termine.filter((t) => t.art === 'frei' && t.wiederholung !== 'woechentlich');
    const out = [];
    termine.forEach((t) => {
        if (!t.datum) return;
        if (t.wiederholung === 'woechentlich') {
            const letzter = t.bis && t.bis < bis ? t.bis : bis;
            for (let d = t.datum, i = 0; d <= letzter && i < 400; d = plusTage(d, 7), i++) {
                if (d >= von && (t.art === 'frei' || !istFrei(frei, d))) out.push({ termin: t, datum: d, ende: d });
            }
            return;
        }
        const ende = t.ende && t.ende > t.datum ? t.ende : t.datum;
        if (ende >= von && t.datum <= bis) out.push({ termin: t, datum: t.datum, ende });
    });
    return out.sort((a, b) => a.datum.localeCompare(b.datum) || String(a.termin.uhrzeit || '').localeCompare(String(b.termin.uhrzeit || '')));
}

// Die nächsten n Vorkommen ab heute (laufende mehrtägige Termine zählen mit)
export function naechsteTermine(termine, n, tag = heute()) {
    return termineZwischen(termine, tag, plusTage(tag, 400)).slice(0, n);
}

// „Mo 16.11. · 18:00“ oder „21.12. – 3.1.2027“ (mehrtägig)
export function terminZeit(v) {
    if (v.ende && v.ende !== v.datum) return datumKurz(v.datum) + ' – ' + datumKurz(v.ende, true);
    return wochentag(v.datum) + ' ' + datumKurz(v.datum) + (v.termin.uhrzeit ? ' · ' + v.termin.uhrzeit : '');
}

// Wiederkehrende Termine kurz beschrieben: „Jeden Mo · 18:00“
export function wiederholungText(t) {
    return 'Jeden ' + wochentag(t.datum) + (t.uhrzeit ? ' · ' + t.uhrzeit : '') + (t.bis ? ' · bis ' + datumKurz(t.bis, true) : '');
}

// Einmalige Termine je Arbeitsschritt für den Zeitstrahl: ein Termin gehört zum letzten Schritt, der an oder vor seinem Datum beginnt
// (wie bei den Meilensteinen), sonst zum ersten. Ergebnis: Array parallel zu schritte, je Eintrag [{ termin, datum, ende }].
export function termineJeSchritt(termine, schritte) {
    const je = schritte.map(() => []);
    if (!schritte.length) return je;
    termineZwischen(termine.filter((t) => t.wiederholung !== 'woechentlich'), '0000-01-01', '9999-12-31').forEach((v) => {
        je[Math.max(0, planIndex(schritte, v.datum))].push(v);
    });
    return je;
}
