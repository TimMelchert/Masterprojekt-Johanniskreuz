// Masterprojekt Johanniskreuz – Start, Leiste, Routing (#/<bereich>) und Hinweis auf neue Version.
// Ohne Anmeldung gibt es nur die Startseite und „Info“ (docs/STAND.md 2.1).

import { VERSION, features, BEREICHE } from './config.js';
import { el, leeren } from './ui/dom.js';
import { istAngemeldet } from './store.js';
import { wendeAussehenAn } from './ui/aussehen.js';
import { vergessen } from './daten.js';
import * as start from './views/start.js';
import * as info from './views/info.js';
import * as platzhalter from './views/platzhalter.js';
import * as arbeitsschritte from './views/arbeitsschritte.js';
import * as todos from './views/todos.js';
import * as nichtgefunden from './views/nichtgefunden.js';

const aktiv = BEREICHE.filter((b) => features[b.id]);

// Adresse → Ansicht. Bereiche ohne eigene Ansicht zeigen bis zu ihrer Etappe einen Platzhalter.
const ANSICHTEN = { '': start, start, info, arbeitsschritte, todos };
aktiv.forEach((b) => { if (!ANSICHTEN[b.id]) ANSICHTEN[b.id] = platzhalter; });

// Leiste: Start und alle Bereiche, nur wenn angemeldet. Wird nur neu gebaut, wenn sich etwas ändert.
let leisteFuer = null;
function baueLeiste(angemeldet) {
    if (leisteFuer === angemeldet) return;
    leisteFuer = angemeldet;
    const leiste = document.getElementById('reiter');
    leeren(leiste);
    leiste.hidden = !angemeldet;
    if (!angemeldet) return;
    const eintraege = [{ id: 'start', titel: 'Start', kurz: 'Start', feld: null }, ...aktiv];
    eintraege.forEach((b) => {
        leiste.append(el('a', {
            class: 'reiter-link',
            attrs: { href: '#/' + b.id, 'data-route': b.id, 'data-feld': b.feld }
        }, [
            el('span', { class: 'reiter-punkt', attrs: { 'aria-hidden': 'true' } }),
            el('span', { class: 'reiter-name reiter-name-lang', text: b.titel }),
            el('span', { class: 'reiter-name reiter-name-kurz', text: b.kurz, attrs: { 'aria-hidden': 'true' } })
        ]));
    });
}

function aktuelleRoute() {
    return location.hash.replace(/^#\/?/, '').split('/')[0];
}

function zeigeAnsicht() {
    const angemeldet = istAngemeldet();
    baueLeiste(angemeldet);
    let route = aktuelleRoute();
    if (route === 'start') route = '';
    // Ohne Anmeldung: alles außer Start und Info führt zur Startseite
    if (!angemeldet && route !== '' && route !== 'info') route = '';
    const ansicht = ANSICHTEN[route] || nichtgefunden;
    const bereich = aktiv.find((b) => b.id === route) || null;
    const container = document.getElementById('inhalt');

    leeren(container);
    document.body.setAttribute('data-seite', route || 'start');
    if (bereich) container.setAttribute('data-feld', bereich.feld);
    else container.removeAttribute('data-feld');

    const teile = location.hash.replace(/^#\/?/, '').split('/').slice(1);
    ansicht.render(container, { route, teile, bereich, bereiche: aktiv, angemeldet, version: VERSION, neuZeichnen: zeigeAnsicht });

    const aktuell = route || 'start';
    document.querySelectorAll('[data-route]').forEach((a) => {
        if (a.getAttribute('data-route') === aktuell) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
    });
    container.focus({ preventScroll: true });
}

// Neue Version: Hinweis zeigen, auf Tipp neu laden.
function beobachteUpdates(reg) {
    const hinweis = document.getElementById('update-hinweis');
    const knopf = document.getElementById('update-knopf');
    let wartend = null;

    const zeige = (sw) => { wartend = sw; hinweis.hidden = false; };

    if (reg.waiting && navigator.serviceWorker.controller) zeige(reg.waiting);
    reg.addEventListener('updatefound', () => {
        const neu = reg.installing;
        if (!neu) return;
        neu.addEventListener('statechange', () => {
            if (neu.state === 'installed' && navigator.serviceWorker.controller) zeige(neu);
        });
    });

    // Neu laden nur, wenn auf dieser Seite „Jetzt neu laden“ getippt wurde (Erfahrung aus Thetadex).
    let gewuenscht = false;
    knopf.addEventListener('click', () => {
        if (!wartend) return;
        if (wartend.state === 'activated') { location.reload(); return; }
        gewuenscht = true;
        wartend.postMessage('skipWaiting');
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!gewuenscht) return;
        gewuenscht = false;
        location.reload();
    });
}

// Schutz vor fremden Rahmen: Bettet eine andere Seite die App ein, zeigt sie nur einen Hinweis.
// Der Server-Kopf „frame-ancestors“ geht auf GitHub Pages nicht.
let imRahmen = true;
try { imRahmen = window.top !== window.self; } catch (e) { /* fremder Rahmen */ }

wendeAussehenAn();
if (imRahmen) {
    const inhalt = document.getElementById('inhalt');
    leeren(inhalt);
    inhalt.append(el('p', { class: 'meldung', text: 'Bitte die Seite direkt öffnen, nicht eingebettet in einer anderen Seite.' }));
} else {
    window.addEventListener('hashchange', zeigeAnsicht);
    // Anmelden, Abmelden oder Passwort ungültig: Leiste und Seite neu zeichnen
    window.addEventListener('johanniskreuz-abgemeldet', () => { vergessen(); zeigeAnsicht(); });
    zeigeAnsicht();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then((reg) => { beobachteUpdates(reg); reg.update(); })
                .catch(() => {});
        });
    }
}
