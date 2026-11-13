// Formulare im Fenster für Arbeitsschritte, Unterpunkte, ToDos und Meilensteine.
// felder: [{ name, titel, art: 'text'|'lang'|'datum'|'wahl'|'farbe'|'haken', pflicht, werte: [{id, titel}], hilfe }]
// formularFenster(titel, felder, werte, { speichern(daten) → Promise, loeschen() → Promise | null })
// Schließt erst, wenn das Skript den Erfolg bestätigt hat. Bei Fehlern bleibt alles stehen (docs/STAND.md 1.5).

import { el } from './dom.js';
import { zeigeFenster, frage } from './fenster.js';

let zaehler = 0;

function feldBauen(f, wert) {
    const id = 'f-' + (++zaehler) + '-' + f.name;
    let eingabe;
    if (f.art === 'lang') {
        eingabe = el('textarea', { class: 'eingabe', attrs: { id, name: f.name, rows: 3, maxlength: 2000 } });
        eingabe.value = wert || '';
    } else if (f.art === 'wahl') {
        eingabe = el('select', { class: 'eingabe', attrs: { id, name: f.name } });
        if (!f.pflicht) eingabe.append(el('option', { text: f.leer || '–', attrs: { value: '' } }));
        f.werte.forEach((w) => eingabe.append(el('option', { text: w.titel, attrs: { value: w.id } })));
        eingabe.value = wert != null ? wert : (f.pflicht && f.werte[0] ? f.werte[0].id : '');
    } else if (f.art === 'farbe') {
        const gruppe = el('fieldset', { class: 'farbwahl' }, [el('legend', { text: f.titel })]);
        f.werte.forEach((w, i) => {
            const r = el('input', { attrs: { type: 'radio', name: f.name, id: id + '-' + w.id, value: w.id, checked: (wert || f.werte[0].id) === w.id } });
            gruppe.append(el('label', { class: 'farbe-feld', attrs: { for: id + '-' + w.id, 'data-farbe': w.id, title: w.titel } }, [
                r, el('span', { class: 'farbe-punkt', attrs: { 'aria-hidden': 'true' } }), el('span', { class: 'nur-leser', text: w.titel })
            ]));
            if (i === 0 && !wert) r.checked = true;
        });
        return { knoten: gruppe, lesen: () => (gruppe.querySelector('input:checked') || {}).value || f.werte[0].id };
    } else if (f.art === 'haken') {
        eingabe = el('input', { attrs: { id, name: f.name, type: 'checkbox', checked: wert === true } });
        return {
            knoten: el('label', { class: 'haken-feld', attrs: { for: id } }, [eingabe, el('span', { text: f.titel })]),
            lesen: () => eingabe.checked
        };
    } else {
        eingabe = el('input', {
            class: 'eingabe',
            attrs: { id, name: f.name, type: f.art === 'datum' ? 'date' : 'text', maxlength: f.max || 200, required: f.pflicht }
        });
        eingabe.value = wert || '';
    }
    const kinder = [el('label', { text: f.titel + (f.pflicht ? ' *' : ''), attrs: { for: id } }), eingabe];
    if (f.hilfe) kinder.push(el('p', { class: 'leise klein', text: f.hilfe }));
    return { knoten: el('div', { class: 'feld' }, kinder), lesen: () => eingabe.value.trim(), eingabe };
}

export function formularFenster(titel, felder, werte, aktionen) {
    const teile = felder.map((f) => ({ f, ...feldBauen(f, werte ? werte[f.name] : undefined) }));
    const meldung = el('p', { class: 'meldung', attrs: { role: 'alert', hidden: true } });
    const speichern = el('button', { class: 'knopf', text: 'Speichern', attrs: { type: 'submit' } });
    const knoepfe = el('div', { class: 'knoepfe' });
    let loeschen = null;
    if (aktionen.loeschen) {
        loeschen = el('button', { class: 'knopf knopf-rot-leise', text: 'Löschen', attrs: { type: 'button' } });
        knoepfe.append(loeschen);
    }
    knoepfe.append(speichern);

    const form = el('form', { class: 'formular', attrs: { novalidate: true } }, [...teile.map((t) => t.knoten), meldung, knoepfe]);
    const fenster = zeigeFenster(titel, form);

    function zeige(text) {
        meldung.textContent = text;
        meldung.hidden = false;
    }

    function sperren(an) {
        speichern.disabled = an;
        if (loeschen) loeschen.disabled = an;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const daten = {};
        for (const t of teile) {
            const v = t.lesen();
            if (t.f.pflicht && (v === '' || v == null)) {
                zeige('Bitte „' + t.f.titel + '“ ausfüllen.');
                if (t.eingabe) t.eingabe.focus();
                return;
            }
            daten[t.f.name] = v;
        }
        if (daten.start && daten.ende && daten.ende < daten.start) {
            zeige('Das Ende liegt vor dem Start.');
            return;
        }
        meldung.hidden = true;
        sperren(true);
        speichern.textContent = 'Speichere …';
        try {
            await aktionen.speichern(daten);
            fenster.schliessen();
        } catch (fehler) {
            zeige(fehler.message || 'Speichern hat nicht geklappt.');
        } finally {
            sperren(false);
            speichern.textContent = 'Speichern';
        }
    });

    if (loeschen) {
        loeschen.addEventListener('click', async () => {
            const ok = await frage('Wirklich löschen?', aktionen.loeschenText || 'Der Eintrag wird gelöscht.', 'Löschen');
            if (!ok) return;
            sperren(true);
            try {
                await aktionen.loeschen();
                fenster.schliessen();
            } catch (fehler) {
                zeige(fehler.message || 'Löschen hat nicht geklappt.');
                sperren(false);
            }
        });
    }
    return fenster;
}
