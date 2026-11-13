// Info: Version, Aussehen, Abmelden, Lizenzen. Auch ohne Anmeldung erreichbar.

import { el } from '../ui/dom.js';
import { abmelden } from '../store.js';
import { AUSSEHEN, aktuellesAussehen, setzeAussehen } from '../ui/aussehen.js';

export function render(container, ctx) {
    container.append(
        el('h1', { text: 'Info' }),
        el('p', { text: 'Arbeitsseite der Projektgruppe im Masterprojekt Johanniskreuz (Pfalzturm, WiSe 2026/27). Alle Dokumente liegen weiter in Seafile.' }),
        el('p', { class: 'leise', text: 'Version ' + ctx.version })
    );

    // Aussehen
    const wahl = el('fieldset', { class: 'wahl' }, [el('legend', { text: 'Aussehen' })]);
    const jetzt = aktuellesAussehen();
    AUSSEHEN.forEach((a) => {
        const knopf = el('input', { attrs: { type: 'radio', name: 'aussehen', id: 'aussehen-' + a.id, value: a.id, checked: a.id === jetzt } });
        knopf.addEventListener('change', () => setzeAussehen(a.id));
        wahl.append(el('label', { class: 'wahl-feld', attrs: { for: 'aussehen-' + a.id } }, [knopf, el('span', { text: a.titel })]));
    });
    container.append(el('section', { class: 'abschnitt' }, [wahl]));

    // Abmelden
    if (ctx.angemeldet) {
        const knopf = el('button', { class: 'knopf knopf-leise', text: 'Abmelden', attrs: { type: 'button' } });
        knopf.addEventListener('click', () => {
            abmelden();
            location.hash = '#/';
            window.dispatchEvent(new Event('johanniskreuz-abgemeldet'));
        });
        container.append(el('section', { class: 'abschnitt' }, [
            el('h2', { text: 'Dieses Gerät' }),
            el('p', { text: 'Abmelden löscht das gespeicherte Passwort und das gewählte Aussehen aus diesem Gerät.' }),
            knopf
        ]));
    }

    container.append(el('section', { class: 'abschnitt' }, [
        el('h2', { text: 'Datenschutz' }),
        el('p', { text: 'Die Seite setzt keine Cookies und nutzt keine Tracker. Im Gerät gespeichert werden nur das Passwort und das gewählte Aussehen. Die Projektdaten liegen in einem Google Sheet der Gruppe und werden nur nach Anmeldung geladen.' })
    ]));
}
