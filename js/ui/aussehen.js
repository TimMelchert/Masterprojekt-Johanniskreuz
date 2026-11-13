// Aussehen hell, dunkel oder wie das Gerät. Die Wahl liegt nur im Gerät (johanniskreuz_aussehen).
// css/base.css liest das Merkmal data-aussehen am <html>.

import { lesen, schreiben } from '../store.js';

export const AUSSEHEN = [
    { id: 'hell', titel: 'Hell' },
    { id: 'dunkel', titel: 'Dunkel' },
    { id: 'geraet', titel: 'Wie Gerät' }
];

export function aktuellesAussehen() {
    const wert = lesen('aussehen', 'geraet');
    return AUSSEHEN.some((a) => a.id === wert) ? wert : 'geraet';
}

// Setzt das Aussehen auf der Seite. Beim Start und nach jeder Wahl aufrufen.
export function wendeAussehenAn() {
    const wert = aktuellesAussehen();
    const wurzel = document.documentElement;
    if (wert === 'geraet') wurzel.removeAttribute('data-aussehen');
    else wurzel.setAttribute('data-aussehen', wert);
}

export function setzeAussehen(wert) {
    const ok = schreiben('aussehen', wert);
    wendeAussehenAn();
    return ok;
}
