// Platzhalter für Bereiche, deren Inhalt in einer späteren Etappe kommt (docs/STAND.md 7).

import { el } from '../ui/dom.js';

export function render(container, ctx) {
    const b = ctx.bereich;
    container.append(
        el('h1', { text: b.titel }),
        el('p', { text: b.text }),
        el('p', { class: 'hinweis', text: 'Dieser Bereich kommt in Etappe ' + b.etappe + '.' })
    );
}
