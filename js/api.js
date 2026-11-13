// Verbindung zum Google Apps Script.
// Jede Anfrage: POST, JSON als text/plain, mit Passwort im Körper (nie in der Adresse).
// Erfolg gibt es nur, wenn das Skript eine Antwort ohne "error" schickt.

import { API_URL } from './config.js';
import { lesen, abmelden } from './store.js';

export class ApiFehler extends Error {
    constructor(code, text) {
        super(text);
        this.code = code;
    }
}

// Anfrage mit dem gespeicherten Passwort. Ist das Passwort nicht mehr richtig
// (zum Beispiel weil die Gruppe es geändert hat), meldet die App das Gerät ab.
export async function api(action, daten = {}) {
    const passwort = lesen('passwort');
    if (!passwort) throw new ApiFehler('anmeldung', 'Bitte zuerst anmelden.');
    try {
        return await senden({ ...daten, pin: passwort, action });
    } catch (e) {
        if (e.code === 'pin') {
            abmelden();
            window.dispatchEvent(new Event('pfalzturm-abgemeldet'));
        }
        throw e;
    }
}

// Prüft ein Passwort, ohne es zu speichern (Anmeldung). Antwort: { ok: true } oder ApiFehler.
export async function pruefePasswort(passwort) {
    return senden({ pin: passwort, action: 'ping' });
}

async function senden(koerper) {
    if (!API_URL) {
        throw new ApiFehler('einrichtung', 'Die Adresse des Google-Skripts fehlt noch (js/config.js, API_URL).');
    }
    let antwort;
    try {
        antwort = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(koerper)
        });
    } catch (e) {
        throw new ApiFehler('netz', 'Keine Verbindung. Bitte Internet prüfen und erneut versuchen.');
    }

    let d;
    try {
        d = await antwort.json();
    } catch (e) {
        throw new ApiFehler('antwort', 'Das Skript hat keine lesbare Antwort geschickt. Ist die richtige Version bereitgestellt?');
    }

    if (d && d.error) throw new ApiFehler(d.error, d.message || 'Unbekannter Fehler');
    return d;
}
