// ToDos: alle ToDos zum Abhaken (Etappe 1.3, docs/PLAN-ETAPPE-1.md).
// Allgemeine ToDos oben, dann je Arbeitsschritt und Unterpunkt eine Gruppe zum Auf- und Zuklappen.
// Filter: Person (aus dem Feld „wer“) und Status. Erledigte bleiben ausgegraut sichtbar (außer Filter „Offen“).
// Die Filter merkt sich die Seite nur, solange sie offen ist (keine Namen im Gerät).

import { el, leeren } from '../ui/dom.js';
import { ladeDaten } from '../daten.js';
import { sortiereSchritte, unterpunkteVon, todosVon, personen, istVon } from '../rechnen.js';
import { todoFormular } from './formulare.js';
import { todoZeile } from './todo-zeile.js';

const filter = { person: '', status: 'alle' };
const zu = new Set();        // zugeklappte Gruppen (ids von Arbeitsschritten und Unterpunkten)

const OHNE = '__ohne__';     // Filterwert „ohne Person“

export function render(container, ctx) {
    container.append(el('h1', { text: ctx.bereich.titel }));
    const inhalt = el('div', { attrs: { 'aria-live': 'polite' } }, [el('p', { class: 'leise', text: 'Lade …' })]);
    container.append(inhalt);
    laden(inhalt, false);
}

async function laden(inhalt, neu) {
    try {
        zeichne(inhalt, await ladeDaten(neu));
    } catch (fehler) {
        leeren(inhalt);
        const knopf = el('button', { class: 'knopf', text: 'Erneut versuchen', attrs: { type: 'button' } });
        knopf.addEventListener('click', () => laden(inhalt, true));
        inhalt.append(el('p', { class: 'meldung', text: fehler.message }), knopf);
    }
}

function passt(t) {
    if (filter.status === 'offen' && t.erledigt) return false;
    if (filter.status === 'erledigt' && !t.erledigt) return false;
    if (filter.person === OHNE) return !String(t.wer || '').trim();
    if (filter.person) return istVon(t, filter.person);
    return true;
}

function auswahl(id, titel, werte, wert, beiWahl) {
    const s = el('select', { class: 'eingabe', attrs: { id } });
    werte.forEach((w) => s.append(el('option', { text: w.titel, attrs: { value: w.id } })));
    s.value = wert;
    s.addEventListener('change', () => beiWahl(s.value));
    return el('div', { class: 'feld' }, [el('label', { text: titel, attrs: { for: id } }), s]);
}

function zeichne(inhalt, stand) {
    const neuZeichnen = () => zeichne(inhalt, stand);
    leeren(inhalt);

    const neu = el('button', { class: 'knopf', text: '+ ToDo', attrs: { type: 'button' } });
    neu.addEventListener('click', () => todoFormular(stand, '', null, neuZeichnen));
    const neuLaden = el('button', { class: 'knopf knopf-leise', text: 'Neu laden', attrs: { type: 'button' } });
    neuLaden.addEventListener('click', () => laden(inhalt, true));
    inhalt.append(el('div', { class: 'werkzeuge' }, [neu, neuLaden]));

    // Filter
    const namen = personen(stand.todos);
    if (filter.person && filter.person !== OHNE && !namen.includes(filter.person)) filter.person = '';
    inhalt.append(el('div', { class: 'filter' }, [
        auswahl('filter-person', 'Person', [{ id: '', titel: 'Alle' }, ...namen.map((n) => ({ id: n, titel: n })), { id: OHNE, titel: 'Ohne Person' }],
            filter.person, (v) => { filter.person = v; neuZeichnen(); }),
        auswahl('filter-status', 'Status', [{ id: 'alle', titel: 'Alle' }, { id: 'offen', titel: 'Offen' }, { id: 'erledigt', titel: 'Erledigt' }],
            filter.status, (v) => { filter.status = v; neuZeichnen(); })
    ]));

    const sichtbar = stand.todos.filter(passt);
    const offenZahl = sichtbar.filter((t) => !t.erledigt).length;
    inhalt.append(el('p', { class: 'leise', text: offenZahl + ' offen · ' + (sichtbar.length - offenZahl) + ' erledigt' }));

    if (!stand.todos.length) {
        inhalt.append(el('p', { class: 'hinweis', text: 'Noch keine ToDos. Lege eines mit „+ ToDo“ an oder beim Unterpunkt unter „Schritte“.' }));
        return;
    }
    if (!sichtbar.length) {
        inhalt.append(el('p', { class: 'hinweis', text: 'Keine ToDos für diesen Filter.' }));
        return;
    }

    const liste = (todos) => el('ul', { class: 'todo-liste' }, todos.map((t) => todoZeile(t, { stand, neuZeichnen })));

    // Allgemeine ToDos
    const allgemein = todosVon(stand, '').filter(passt);
    if (allgemein.length) {
        inhalt.append(el('section', { class: 'todo-gruppe' }, [el('h2', { text: 'Allgemein' }), liste(allgemein)]));
    }

    // Je Arbeitsschritt
    sortiereSchritte(stand.arbeitsschritte).forEach((s) => {
        const unter = unterpunkteVon(stand, s.id)
            .map((u) => ({ u, todos: todosVon(stand, u.id).filter(passt) }))
            .filter((x) => x.todos.length);
        if (!unter.length) return;
        const anzahl = unter.reduce((n, x) => n + x.todos.filter((t) => !t.erledigt).length, 0);
        const auf = !zu.has(s.id);
        const kinder = [klapper(s.id, auf, s.titel, anzahl + ' offen', 'h2', neuZeichnen)];
        if (auf) {
            kinder.push(el('ul', { class: 'unterpunkte' }, unter.map(({ u, todos }) => {
                const uAuf = !zu.has(u.id);
                const offenU = todos.filter((t) => !t.erledigt).length;
                return el('li', { class: 'unterpunkt' }, [
                    klapper(u.id, uAuf, u.titel, offenU + ' offen', 'h3', neuZeichnen),
                    uAuf ? liste(todos) : null
                ]);
            })));
        }
        inhalt.append(el('section', { class: 'todo-gruppe', attrs: { 'data-farbe': s.farbe } }, kinder));
    });
}

// Überschrift mit Toggler (▸/▾) für eine Gruppe
function klapper(id, auf, titel, zusatz, ebene, neuZeichnen) {
    const knopf = el('button', { class: 'toggler', attrs: { type: 'button', 'aria-expanded': auf ? 'true' : 'false' } }, [
        el('span', { class: 'toggler-pfeil', text: auf ? '▾' : '▸', attrs: { 'aria-hidden': 'true' } }),
        el('span', { class: ebene === 'h2' ? 'gruppe-titel' : 'unterpunkt-titel', text: titel }),
        el('span', { class: 'leise klein', text: zusatz })
    ]);
    knopf.addEventListener('click', () => {
        if (zu.has(id)) zu.delete(id);
        else zu.add(id);
        neuZeichnen();
    });
    return el(ebene, { class: 'klapper' }, [knopf]);
}
