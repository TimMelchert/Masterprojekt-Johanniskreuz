// Eine ToDo-Zeile mit Haken zum Abhaken. Erledigte bleiben stehen, ausgegraut und durchgestrichen.
// Antippen des Textes öffnet das Formular zum Bearbeiten. Wird vom Zeitstrahl und der ToDo-Seite benutzt.

import { el } from '../ui/dom.js';
import { hake } from '../daten.js';
import { zeigeMeldung } from '../ui/meldung.js';
import { datumKurz, heute } from '../rechnen.js';
import { todoFormular } from './formulare.js';

let zaehler = 0;

// opt: { stand, neuZeichnen, zusatz (Text, z. B. „Arbeitsschritt › Unterpunkt“) }
export function todoZeile(todo, opt) {
    const id = 'todo-' + (++zaehler);
    const haken = el('input', { class: 'todo-haken', attrs: { type: 'checkbox', id, checked: todo.erledigt } });
    const ueberfaellig = !todo.erledigt && todo.faellig && todo.faellig < heute();

    const infos = [];
    if (todo.wer) infos.push(el('span', { class: 'todo-wer', text: todo.wer }));
    if (todo.faellig) infos.push(el('span', { class: ueberfaellig ? 'todo-faellig todo-ueberfaellig' : 'todo-faellig', text: 'fällig ' + datumKurz(todo.faellig, true) }));
    if (opt.zusatz) infos.push(el('span', { class: 'leise', text: opt.zusatz }));

    const text = el('button', { class: 'todo-text', attrs: { type: 'button', 'aria-label': 'Bearbeiten: ' + todo.titel } }, [
        el('span', { class: 'todo-titel', text: todo.titel }),
        infos.length ? el('span', { class: 'todo-infos' }, infos) : null
    ]);
    text.addEventListener('click', () => todoFormular(opt.stand, todo.unterpunkt_id, todo, opt.neuZeichnen));

    haken.addEventListener('change', async () => {
        const wert = haken.checked;
        haken.disabled = true;
        try {
            await hake(todo.id, wert);
            opt.neuZeichnen();
        } catch (fehler) {
            haken.checked = !wert;
            haken.disabled = false;
            zeigeMeldung(fehler.message || 'Abhaken hat nicht geklappt.');
        }
    });

    return el('li', { class: todo.erledigt ? 'todo todo-erledigt' : 'todo' }, [
        el('label', { class: 'todo-haken-feld', attrs: { for: id } }, [haken, el('span', { class: 'nur-leser', text: 'Erledigt: ' + todo.titel })]),
        text
    ]);
}
