// Fenster (Dialog) mit Titel, Inhalt und ✕ oben rechts. Nutzt das eingebaute <dialog>:
// Esc schließt, der Fokus bleibt im Fenster, Bildschirmleser erkennen es als Dialog.
// zeigeFenster(titel, inhalt, beiZu) → { schliessen }

import { el } from './dom.js';

export function zeigeFenster(titel, inhalt, beiZu) {
    const vorher = document.activeElement;
    const dialog = el('dialog', { class: 'fenster', attrs: { 'aria-label': titel } });
    let offen = true;

    function zu() {
        if (!offen) return;
        offen = false;
        if (dialog.open) dialog.close();
        dialog.remove();
        if (vorher && vorher.focus) vorher.focus({ preventScroll: true });
        if (beiZu) beiZu();
    }

    const x = el('button', { class: 'fenster-x', text: '✕', attrs: { type: 'button', 'aria-label': 'Fenster schließen' } });
    x.addEventListener('click', zu);
    dialog.addEventListener('close', zu);
    // Klick auf den grauen Rand schließt nicht (sonst gehen halb ausgefüllte Formulare verloren)

    dialog.append(el('div', { class: 'fenster-kopf' }, [el('h2', { text: titel }), x]), inhalt);
    document.body.append(dialog);
    dialog.showModal();
    const erstes = dialog.querySelector('input:not([type=hidden]), textarea, select');
    if (erstes) erstes.focus();
    return { schliessen: zu };
}

// Kurze Nachfrage mit zwei Knöpfen. Gibt ein Promise mit true (Ja) oder false zurück.
// gefaehrlich = false: Ja-Knopf normal statt rot (zum Beispiel „Einlesen“)
export function frage(titel, text, jaText = 'Ja', gefaehrlich = true) {
    return new Promise((fertig) => {
        let antwort = false;
        const ja = el('button', { class: gefaehrlich ? 'knopf knopf-rot' : 'knopf', text: jaText, attrs: { type: 'button' } });
        const nein = el('button', { class: 'knopf knopf-leise', text: 'Abbrechen', attrs: { type: 'button' } });
        const f = zeigeFenster(titel, el('div', {}, [
            el('p', { text }),
            el('div', { class: 'knoepfe' }, [nein, ja])
        ]), () => fertig(antwort));
        ja.addEventListener('click', () => { antwort = true; f.schliessen(); });
        nein.addEventListener('click', () => f.schliessen());
    });
}
