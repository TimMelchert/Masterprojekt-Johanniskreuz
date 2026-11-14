// Startseite.
// Ohne Anmeldung: Projekttitel, kurzer Satz und Anmeldefeld (sonst nichts, docs/STAND.md 2.1).
// Mit Anmeldung: Kacheln der Bereiche, nur mit Titel (Themenfelder seit 0.1.1 und Beschreibungen seit 0.2.4 nicht mehr, Wunsch der Person).

import { el } from '../ui/dom.js';
import { schreiben } from '../store.js';
import { pruefePasswort } from '../api.js';

export function render(container, ctx) {
    container.append(el('section', { class: 'start-kopf' }, [
        el('img', { class: 'start-logo', attrs: { src: 'icons/icon.svg', alt: '', width: 96, height: 96 } }),
        el('h1', { text: 'Masterprojekt Johanniskreuz' }),
        el('p', { class: 'leise', text: 'Pfalzturm · WiSe 2026/27 · Arbeitsseite der Projektgruppe' })
    ]));

    if (!ctx.angemeldet) {
        container.append(anmeldung(ctx));
        return;
    }

    const kacheln = el('div', { class: 'kacheln' });
    ctx.bereiche.forEach((b) => {
        kacheln.append(el('a', { class: 'kachel', attrs: { href: '#/' + b.id, 'data-feld': b.feld } }, [
            el('h2', { text: b.titel })
        ]));
    });
    container.append(kacheln);
}

function anmeldung(ctx) {
    const feld = el('input', {
        class: 'eingabe',
        attrs: { id: 'passwort', type: 'password', autocomplete: 'current-password', required: true }
    });
    const meldung = el('p', { class: 'meldung', attrs: { role: 'alert', hidden: true } });
    const knopf = el('button', { class: 'knopf', text: 'Anmelden', attrs: { type: 'submit' } });

    const formular = el('form', { class: 'anmeldung', attrs: { novalidate: true } }, [
        el('label', { text: 'Gruppenpasswort', attrs: { for: 'passwort' } }),
        feld,
        knopf,
        meldung,
        el('p', { class: 'leise klein', text: 'Das Gerät merkt sich das Passwort. Abmelden geht unter „Info“.' })
    ]);

    formular.addEventListener('submit', async (e) => {
        e.preventDefault();
        const passwort = feld.value.trim();
        if (!passwort) {
            zeigeMeldung(meldung, 'Bitte das Passwort eingeben.');
            return;
        }
        knopf.disabled = true;
        knopf.textContent = 'Prüfe …';
        meldung.hidden = true;
        try {
            await pruefePasswort(passwort);
            if (!schreiben('passwort', passwort)) {
                zeigeMeldung(meldung, 'Das Gerät kann das Passwort nicht speichern (privates Fenster?).');
                return;
            }
            ctx.neuZeichnen();
        } catch (fehler) {
            zeigeMeldung(meldung, fehler.code === 'pin' ? 'Das Passwort stimmt nicht.' : fehler.message);
        } finally {
            knopf.disabled = false;
            knopf.textContent = 'Anmelden';
        }
    });

    return el('section', { class: 'abschnitt schmal' }, [formular]);
}

function zeigeMeldung(meldung, text) {
    meldung.textContent = text;
    meldung.hidden = false;
}
