// Kurze Meldung unten in der Mitte (zum Beispiel „Abhaken hat nicht geklappt“). Verschwindet nach einigen Sekunden.

import { el } from './dom.js';

let aktuell = null;

export function zeigeMeldung(text, art = 'fehler') {
    if (aktuell) aktuell.remove();
    const m = el('div', { class: 'toast toast-' + art, text, attrs: { role: art === 'fehler' ? 'alert' : 'status' } });
    document.body.append(m);
    aktuell = m;
    setTimeout(() => { if (aktuell === m) { m.remove(); aktuell = null; } }, 5000);
}
