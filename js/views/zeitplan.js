// Zeitplan: Gantt-Diagramm (Etappe 1.4, docs/PLAN-ETAPPE-1.md). Ohne Bibliothek, Aufbau angelehnt an AktionsDeck.
// Zeilen: Meilensteine (Rauten), dann je Arbeitsschritt ein Balken in seiner Farbe mit Fortschritt (Anteil erledigter ToDos).
// Unterpunkte mit Datum klappen unter ihrem Arbeitsschritt auf. Heute-Linie gestrichelt. Antippen öffnet das Formular.
// Positionen setzt das Skript über element.style (erlaubt mit der Content-Security-Policy, kein style="…" im HTML).

import { el, leeren } from '../ui/dom.js';
import { ladeDaten } from '../daten.js';
import {
    heute, sortiereSchritte, unterpunkteVon, fortschrittSchritt, fortschrittUnterpunkt,
    schrittErledigt, unterpunktErledigt, zeitraumText, datumKurz
} from '../rechnen.js';
import { schrittFormular, unterpunktFormular, meilensteinFormular } from './formulare.js';

const offen = new Set();     // aufgeklappte Arbeitsschritte
const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const TAG_MS = 86400000;

// Tage zwischen zwei Daten (JJJJ-MM-TT), in UTC gerechnet (keine Probleme mit Sommerzeit)
function tage(von, bis) {
    return Math.round((Date.UTC(...teile(bis)) - Date.UTC(...teile(von))) / TAG_MS);
}
function teile(iso) {
    const [j, m, t] = iso.split('-').map(Number);
    return [j, m - 1, t];
}
function plus(iso, n) {
    const d = new Date(Date.UTC(...teile(iso)) + n * TAG_MS);
    return d.toISOString().slice(0, 10);
}

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

function zeichne(inhalt, stand) {
    const neuZeichnen = () => zeichne(inhalt, stand);
    leeren(inhalt);

    const neuSchritt = el('button', { class: 'knopf', text: '+ Arbeitsschritt', attrs: { type: 'button' } });
    neuSchritt.addEventListener('click', () => schrittFormular(stand, null, neuZeichnen));
    const neuMeilenstein = el('button', { class: 'knopf knopf-leise', text: '+ Meilenstein', attrs: { type: 'button' } });
    neuMeilenstein.addEventListener('click', () => meilensteinFormular(stand, null, neuZeichnen));
    const neuLaden = el('button', { class: 'knopf knopf-leise', text: 'Neu laden', attrs: { type: 'button' } });
    neuLaden.addEventListener('click', () => laden(inhalt, true));
    inhalt.append(el('div', { class: 'werkzeuge' }, [neuSchritt, neuMeilenstein, neuLaden]));

    const schritte = sortiereSchritte(stand.arbeitsschritte);
    const tag = heute();

    // Zeitraum: frühestes bis spätestes Datum, dazu heute, mit etwas Rand
    const daten = [tag];
    schritte.forEach((s) => { if (s.start) daten.push(s.start); if (s.ende) daten.push(s.ende); });
    stand.unterpunkte.forEach((u) => { if (u.start) daten.push(u.start); if (u.ende) daten.push(u.ende); });
    stand.meilensteine.forEach((m) => daten.push(m.datum));
    if (daten.length < 2) {
        inhalt.append(el('p', { class: 'hinweis', text: 'Noch keine Arbeitsschritte mit Datum. Lege einen mit Start und Ende an.' }));
        return;
    }
    daten.sort();
    const von = plus(daten[0], -4);
    const bis = plus(daten[daten.length - 1], 7);
    const anzahl = tage(von, bis) + 1;
    const breit = window.matchMedia('(min-width: 768px)').matches;
    const proTag = breit ? 14 : 10;
    const breite = anzahl * proTag;
    const x = (iso) => tage(von, iso) * proTag;

    const flaeche = el('div', { class: 'gantt-spur gantt-kopf-spur' });
    flaeche.style.width = breite + 'px';
    // Monate und Wochen (Montage)
    for (let i = 0; i < anzahl; i++) {
        const d = plus(von, i);
        const [, m, t] = teile(d);
        if (t === 1 || i === 0) {
            const mon = el('span', { class: 'gantt-monat', text: MONATE[m] + (m === 0 || i === 0 ? ' ' + d.slice(0, 4) : '') });
            mon.style.left = x(d) + 'px';
            flaeche.append(mon);
        }
        if (new Date(Date.UTC(...teile(d))).getUTCDay() === 1) {
            const w = el('span', { class: 'gantt-woche', text: String(t) });
            w.style.left = x(d) + 'px';
            flaeche.append(w);
        }
    }

    const zeilen = [el('div', { class: 'gantt-zeile gantt-kopf' }, [el('div', { class: 'gantt-name' }), flaeche])];

    // Meilensteine
    if (stand.meilensteine.length) {
        const spur = el('div', { class: 'gantt-spur' });
        spur.style.width = breite + 'px';
        [...stand.meilensteine].sort((a, b) => a.datum.localeCompare(b.datum)).forEach((m) => {
            const k = el('button', { class: 'gantt-meilenstein', attrs: { type: 'button', title: m.titel + ' · ' + datumKurz(m.datum, true), 'aria-label': 'Meilenstein ' + m.titel + ', ' + datumKurz(m.datum, true) } }, [
                el('span', { class: 'raute', attrs: { 'aria-hidden': 'true' } }),
                el('span', { class: 'gantt-meilenstein-text', text: m.titel })
            ]);
            k.style.left = (x(m.datum) + proTag / 2) + 'px';
            k.addEventListener('click', () => meilensteinFormular(stand, m, neuZeichnen));
            spur.append(k);
        });
        zeilen.push(el('div', { class: 'gantt-zeile' }, [el('div', { class: 'gantt-name', text: 'Meilensteine' }), spur]));
    }

    // Arbeitsschritte und aufgeklappte Unterpunkte
    schritte.forEach((s) => {
        const ups = unterpunkteVon(stand, s.id).filter((u) => u.start || u.ende);
        const auf = offen.has(s.id);
        const name = ups.length
            ? el('button', { class: 'gantt-name gantt-toggler', attrs: { type: 'button', 'aria-expanded': auf ? 'true' : 'false' } }, [
                el('span', { class: 'toggler-pfeil', text: auf ? '▾' : '▸', attrs: { 'aria-hidden': 'true' } }),
                el('span', { text: s.titel })
            ])
            : el('div', { class: 'gantt-name' }, [el('span', { text: s.titel })]);
        if (ups.length) name.addEventListener('click', () => { if (auf) offen.delete(s.id); else offen.add(s.id); neuZeichnen(); });
        zeilen.push(el('div', { class: 'gantt-zeile', attrs: { 'data-farbe': s.farbe } }, [
            name,
            spurMitBalken(s, fortschrittSchritt(stand, s.id), schrittErledigt(stand, s), breite, x, proTag, () => schrittFormular(stand, s, neuZeichnen))
        ]));
        if (auf) {
            ups.forEach((u) => {
                zeilen.push(el('div', { class: 'gantt-zeile gantt-unter', attrs: { 'data-farbe': s.farbe } }, [
                    el('div', { class: 'gantt-name' }, [el('span', { text: u.titel })]),
                    spurMitBalken(u, fortschrittUnterpunkt(stand, u.id), unterpunktErledigt(stand, u), breite, x, proTag, () => unterpunktFormular(stand, s.id, u, neuZeichnen))
                ]));
            });
        }
    });

    const heuteLinie = el('div', { class: 'gantt-heute', attrs: { 'aria-hidden': 'true' } }, [el('span', { text: 'Heute' })]);
    heuteLinie.style.left = 'calc(var(--name-breite) + ' + (x(tag) + proTag / 2) + 'px)';
    const raster = el('div', { class: 'gantt-raster' }, [...zeilen, heuteLinie]);

    const rahmen = el('div', { class: 'gantt-rahmen', attrs: { role: 'region', 'aria-label': 'Gantt-Diagramm', tabindex: '0' } }, [raster]);
    inhalt.append(rahmen);
    inhalt.append(el('p', { class: 'leise klein', text: 'Balken antippen zum Bearbeiten. Der dunklere Teil zeigt den Anteil erledigter ToDos.' }));

    // Heute in den Blick holen
    requestAnimationFrame(() => {
        const name = raster.querySelector('.gantt-name');
        const links = name ? name.offsetWidth : 0;
        rahmen.scrollLeft = Math.max(0, x(tag) - (rahmen.clientWidth - links) / 3);
    });
}

// Spur mit einem Balken (oder Hinweis „ohne Datum“)
function spurMitBalken(e, f, fertig, breite, x, proTag, beiKlick) {
    const spur = el('div', { class: 'gantt-spur' });
    spur.style.width = breite + 'px';
    const start = e.start || e.ende;
    const ende = e.ende || e.start;
    if (!start) {
        spur.append(el('span', { class: 'leise klein gantt-ohne', text: 'ohne Datum' }));
        return spur;
    }
    const titel = e.titel + ' · ' + zeitraumText(e.start, e.ende) + (f.gesamt ? ' · ' + f.erledigt + '/' + f.gesamt + ' ToDos' : '');
    const balken = el('button', { class: 'gantt-balken' + (fertig ? ' gantt-fertig' : ''), attrs: { type: 'button', title: titel, 'aria-label': titel } });
    balken.style.left = x(start) + 'px';
    balken.style.width = Math.max(proTag, x(ende) - x(start) + proTag) + 'px';
    if (f.gesamt) {
        const voll = el('span', { class: 'gantt-voll' });
        voll.style.width = Math.round(100 * f.erledigt / f.gesamt) + '%';
        balken.append(voll);
    }
    balken.addEventListener('click', beiKlick);
    spur.append(balken);
    return spur;
}
