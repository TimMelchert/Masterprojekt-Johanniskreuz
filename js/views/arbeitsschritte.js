// Arbeitsschritte: horizontaler Zeitstrahl (Etappe 1.2, docs/PLAN-ETAPPE-1.md).
// Arbeitsschritte als farbige Abschnitte nebeneinander, Meilensteine als Raute dazwischen.
// Zwei Pfeile darüber: „Plan“ (heute laut Datum) und „Stand“ (erster nicht erledigter Schritt).
// Antippen eines Abschnitts zeigt darunter seine Unterpunkte; jeder Unterpunkt klappt seine ToDos auf.

import { el, leeren } from '../ui/dom.js';
import { ladeDaten, STATUS } from '../daten.js';
import {
    sortiereSchritte, planIndex, standIndex, vergleichText, zeitstrahlReihe, zeitraumText, datumKurz,
    fortschrittSchritt, fortschrittUnterpunkt, schrittErledigt, unterpunktErledigt, unterpunkteVon, todosVon
} from '../rechnen.js';
import { schrittFormular, unterpunktFormular, todoFormular, meilensteinFormular } from './formulare.js';
import { todoZeile } from './todo-zeile.js';

// Bleibt beim Neuzeichnen erhalten (nur solange die Seite offen ist)
let gewaehlt = null;          // id des gewählten Arbeitsschritts
const offen = new Set();      // ids der aufgeklappten Unterpunkte

export function render(container, ctx) {
    container.append(el('h1', { text: ctx.bereich.titel }));
    const inhalt = el('div', { attrs: { 'aria-live': 'polite' } }, [el('p', { class: 'leise', text: 'Lade …' })]);
    container.append(inhalt);
    laden(inhalt, false);
}

async function laden(inhalt, neu) {
    try {
        const stand = await ladeDaten(neu);
        zeichne(inhalt, stand);
    } catch (fehler) {
        leeren(inhalt);
        const knopf = el('button', { class: 'knopf', text: 'Erneut versuchen', attrs: { type: 'button' } });
        knopf.addEventListener('click', () => laden(inhalt, true));
        inhalt.append(el('p', { class: 'meldung', text: fehler.message }), knopf);
    }
}

function zeichne(inhalt, stand) {
    const neuZeichnen = () => zeichne(inhalt, stand);
    leeren(inhalt);

    const schritte = sortiereSchritte(stand.arbeitsschritte);
    const plan = planIndex(schritte);
    const ist = standIndex(stand, schritte);
    if (!schritte.some((s) => s.id === gewaehlt)) gewaehlt = (schritte[Math.min(ist, schritte.length - 1)] || {}).id || null;

    // Knöpfe oben
    const neuSchritt = el('button', { class: 'knopf', text: '+ Arbeitsschritt', attrs: { type: 'button' } });
    neuSchritt.addEventListener('click', () => schrittFormular(stand, null, neuZeichnen));
    const neuMeilenstein = el('button', { class: 'knopf knopf-leise', text: '+ Meilenstein', attrs: { type: 'button' } });
    neuMeilenstein.addEventListener('click', () => meilensteinFormular(stand, null, neuZeichnen));
    const neuLaden = el('button', { class: 'knopf knopf-leise', text: 'Neu laden', attrs: { type: 'button' } });
    neuLaden.addEventListener('click', () => laden(inhalt, true));
    inhalt.append(el('div', { class: 'werkzeuge' }, [neuSchritt, neuMeilenstein, neuLaden]));

    if (!schritte.length && !stand.meilensteine.length) {
        inhalt.append(el('p', { class: 'hinweis', text: 'Noch keine Arbeitsschritte. Lege den ersten mit „+ Arbeitsschritt“ an.' }));
        return;
    }

    // Legende und Vergleich der Pfeile
    const satz = vergleichText(plan, ist, schritte.length);
    inhalt.append(el('div', { class: 'pfeil-legende' }, [
        el('span', { class: 'pfeil-marke pfeil-plan', text: '▼ Plan' }),
        el('span', { class: 'leise', text: 'heute laut Datum' }),
        el('span', { class: 'pfeil-marke pfeil-stand', text: '▼ Stand' }),
        el('span', { class: 'leise', text: 'erster offener Schritt' }),
        satz ? el('strong', { class: 'pfeil-satz', text: satz }) : null
    ]));

    // Der Strahl
    const strahl = el('ol', { class: 'strahl', attrs: { 'aria-label': 'Zeitstrahl der Arbeitsschritte' } });
    let gewaehltKnoten = null;
    zeitstrahlReihe(schritte, stand.meilensteine).forEach((teil) => {
        if (teil.art === 'meilenstein') {
            const m = teil.meilenstein;
            const knopf = el('button', { class: 'meilenstein', attrs: { type: 'button', title: 'Meilenstein bearbeiten' } }, [
                el('span', { class: 'pfeile' }),
                el('span', { class: 'raute', attrs: { 'aria-hidden': 'true' } }),
                el('span', { class: 'meilenstein-datum', text: datumKurz(m.datum, true) }),
                el('span', { class: 'meilenstein-titel', text: m.titel })
            ]);
            knopf.addEventListener('click', () => meilensteinFormular(stand, m, neuZeichnen));
            strahl.append(el('li', { class: 'strahl-teil' }, [knopf]));
            return;
        }
        const s = teil.schritt;
        const f = fortschrittSchritt(stand, s.id);
        const fertig = schrittErledigt(stand, s);
        const pfeile = el('span', { class: 'pfeile' }, [
            teil.index === plan ? el('span', { class: 'pfeil pfeil-plan', text: '▼ Plan' }) : null,
            teil.index === ist ? el('span', { class: 'pfeil pfeil-stand', text: '▼ Stand' }) : null
        ]);
        const knopf = el('button', {
            class: 'abschnitt-knopf' + (fertig ? ' abschnitt-fertig' : ''),
            attrs: { type: 'button', 'data-farbe': s.farbe, 'aria-pressed': s.id === gewaehlt ? 'true' : 'false' }
        }, [
            pfeile,
            el('span', { class: 'abschnitt-band' }, [
                el('span', { class: 'abschnitt-titel', text: s.titel }),
                el('span', { class: 'abschnitt-zeit', text: zeitraumText(s.start, s.ende) })
            ]),
            el('span', { class: 'abschnitt-stand' }, [
                el('span', { text: fertig ? '✓ erledigt' : statusText(s.status) }),
                f.gesamt ? el('span', { text: f.erledigt + '/' + f.gesamt + ' ToDos' }) : null
            ]),
            f.gesamt ? el('span', { class: 'balken', attrs: { 'aria-hidden': 'true' } }, [
                el('span', { class: 'balken-voll', attrs: { 'data-anteil': String(Math.round(10 * f.erledigt / f.gesamt)) } })
            ]) : null
        ]);
        knopf.addEventListener('click', () => { gewaehlt = s.id; neuZeichnen(); });
        const li = el('li', { class: 'strahl-teil' }, [knopf]);
        if (s.id === gewaehlt) gewaehltKnoten = li;
        strahl.append(li);
    });
    const rahmen = el('div', { class: 'strahl-rahmen' }, [strahl]);
    inhalt.append(rahmen);

    // Gewählten Schritt seitlich in den Blick holen (nur den Strahl verschieben, nicht die Seite)
    if (gewaehltKnoten) {
        requestAnimationFrame(() => {
            rahmen.scrollLeft = Math.max(0, gewaehltKnoten.offsetLeft - (rahmen.clientWidth - gewaehltKnoten.offsetWidth) / 2);
        });
    }

    const schritt = schritte.find((s) => s.id === gewaehlt);
    if (schritt) inhalt.append(details(stand, schritt, neuZeichnen));

    const allgemein = todosVon(stand, '');
    if (allgemein.length) {
        inhalt.append(el('section', { class: 'abschnitt' }, [
            el('h2', { text: 'Allgemeine ToDos' }),
            el('ul', { class: 'todo-liste' }, allgemein.map((t) => todoZeile(t, { stand, neuZeichnen })))
        ]));
    }
}

function statusText(id) {
    return (STATUS.find((s) => s.id === id) || STATUS[0]).titel;
}

// Unterpunkte und ToDos des gewählten Arbeitsschritts
function details(stand, s, neuZeichnen) {
    const bearbeiten = el('button', { class: 'knopf knopf-leise', text: 'Bearbeiten', attrs: { type: 'button' } });
    bearbeiten.addEventListener('click', () => schrittFormular(stand, s, neuZeichnen));
    const neuUnterpunkt = el('button', { class: 'knopf', text: '+ Unterpunkt', attrs: { type: 'button' } });
    neuUnterpunkt.addEventListener('click', () => unterpunktFormular(stand, s.id, null, neuZeichnen));

    const teile = [
        el('div', { class: 'details-kopf' }, [
            el('div', {}, [
                el('h2', { text: s.titel }),
                el('p', { class: 'leise', text: zeitraumText(s.start, s.ende) + ' · ' + statusText(s.status) })
            ]),
            el('div', { class: 'werkzeuge' }, [bearbeiten, neuUnterpunkt])
        ])
    ];
    if (s.beschreibung) teile.push(el('p', { class: 'beschreibung', text: s.beschreibung }));

    const unterpunkte = unterpunkteVon(stand, s.id);
    if (!unterpunkte.length) {
        teile.push(el('p', { class: 'leise', text: 'Noch keine Unterpunkte.' }));
    } else {
        teile.push(el('ul', { class: 'unterpunkte' }, unterpunkte.map((u) => unterpunktZeile(stand, u, neuZeichnen))));
    }
    return el('section', { class: 'details', attrs: { 'data-farbe': s.farbe, 'aria-label': 'Arbeitsschritt ' + s.titel } }, teile);
}

function unterpunktZeile(stand, u, neuZeichnen) {
    const auf = offen.has(u.id);
    const f = fortschrittUnterpunkt(stand, u.id);
    const fertig = unterpunktErledigt(stand, u);
    const toggler = el('button', {
        class: 'toggler',
        attrs: { type: 'button', 'aria-expanded': auf ? 'true' : 'false' }
    }, [
        el('span', { class: 'toggler-pfeil', text: auf ? '▾' : '▸', attrs: { 'aria-hidden': 'true' } }),
        el('span', { class: fertig ? 'unterpunkt-titel unterpunkt-fertig' : 'unterpunkt-titel', text: u.titel }),
        el('span', { class: 'leise klein', text: (f.gesamt ? f.erledigt + '/' + f.gesamt : 'keine ToDos') + (u.start || u.ende ? ' · ' + zeitraumText(u.start, u.ende) : '') })
    ]);
    toggler.addEventListener('click', () => {
        if (offen.has(u.id)) offen.delete(u.id);
        else offen.add(u.id);
        neuZeichnen();
    });

    const bearbeiten = el('button', { class: 'knopf-klein', text: 'Bearbeiten', attrs: { type: 'button', 'aria-label': 'Unterpunkt bearbeiten: ' + u.titel } });
    bearbeiten.addEventListener('click', () => unterpunktFormular(stand, u.arbeitsschritt_id, u, neuZeichnen));
    const neuTodo = el('button', { class: 'knopf-klein', text: '+ ToDo', attrs: { type: 'button', 'aria-label': 'Neues ToDo in ' + u.titel } });
    neuTodo.addEventListener('click', () => { offen.add(u.id); todoFormular(stand, u.id, null, neuZeichnen); });

    const kinder = [el('div', { class: 'unterpunkt-kopf' }, [toggler, el('span', { class: 'unterpunkt-knoepfe' }, [bearbeiten, neuTodo])])];
    if (auf) {
        const todos = todosVon(stand, u.id);
        kinder.push(todos.length
            ? el('ul', { class: 'todo-liste' }, todos.map((t) => todoZeile(t, { stand, neuZeichnen })))
            : el('p', { class: 'leise klein einrueck', text: 'Noch keine ToDos.' }));
    }
    return el('li', { class: 'unterpunkt' }, kinder);
}
