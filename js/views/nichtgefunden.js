// Unbekannte Adresse.

import { el } from '../ui/dom.js';

export function render(container) {
    container.append(
        el('h1', { text: 'Seite nicht gefunden' }),
        el('p', {}, [el('a', { text: 'Zur Startseite', attrs: { href: '#/' } })])
    );
}
