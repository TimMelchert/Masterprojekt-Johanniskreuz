// Info: Version, Aussehen, Abmelden, Datenschutz. Auch ohne Anmeldung erreichbar.
// Mit Anmeldung (ab 0.2.6): „Daten einlesen“ für eine Datei mit vielen Einträgen (js/einlesen.js).

import { el } from '../ui/dom.js';
import { abmelden } from '../store.js';
import { AUSSEHEN, aktuellesAussehen, setzeAussehen } from '../ui/aussehen.js';
import { pruefeDatei, einlesen } from '../einlesen.js';
import { frage } from '../ui/fenster.js';

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

    if (ctx.angemeldet) container.append(einlesenAbschnitt());

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

// Datei auswählen, Zusammenfassung zeigen, nach Rückfrage einlesen
function einlesenAbschnitt() {
    const datei = el('input', { class: 'eingabe', attrs: { id: 'einlesen-datei', type: 'file', accept: '.json,application/json' } });
    const meldung = el('p', { class: 'leise', attrs: { 'aria-live': 'polite' } });
    datei.addEventListener('change', async () => {
        const f = datei.files && datei.files[0];
        if (!f) return;
        meldung.className = 'leise';
        let pruef;
        try {
            if (f.size > 1000000) throw new Error('Die Datei ist zu groß.');
            pruef = pruefeDatei(await f.text());
        } catch (fehler) {
            meldung.className = 'meldung';
            meldung.textContent = fehler.message;
            datei.value = '';
            return;
        }
        const z = pruef.zahlen;
        const text = z.arbeitsschritte + ' Arbeitsschritte, ' + z.unterpunkte + ' Unterpunkte, ' + z.todos + ' ToDos, ' +
            z.meilensteine + ' Meilensteine und ' + z.termine + ' Termine. Was es schon gibt (gleicher Titel), wird übersprungen.';
        const ok = await frage('Daten einlesen?', text, 'Einlesen', false);
        if (!ok) { datei.value = ''; return; }
        datei.disabled = true;
        try {
            const erg = await einlesen(pruef.daten, (t) => { meldung.textContent = t; });
            meldung.textContent = 'Fertig: ' + erg.neu + ' neu, ' + erg.uebersprungen + ' schon vorhanden.';
        } catch (fehler) {
            meldung.className = 'meldung';
            meldung.textContent = 'Abgebrochen: ' + (fehler.message || 'Fehler beim Speichern.') + ' Bisher Gespeichertes bleibt. Die Datei kann noch einmal eingelesen werden.';
        } finally {
            datei.disabled = false;
            datei.value = '';
        }
    });
    return el('section', { class: 'abschnitt' }, [
        el('h2', { text: 'Daten einlesen' }),
        el('p', { text: 'Viele Arbeitsschritte, Unterpunkte, ToDos, Meilensteine und Termine auf einmal anlegen, aus einer vorbereiteten Datei (.json). Die Datei kommt nicht ins Netz, nur ihr Inhalt ins Sheet der Gruppe.' }),
        el('div', { class: 'feld' }, [el('label', { text: 'Datei wählen', attrs: { for: 'einlesen-datei' } }), datei]),
        meldung
    ]);
}
