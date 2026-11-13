// Speicher im Gerät (localStorage): nur Passwort und Wahl beim Aussehen (Liste in docs/STAND.md 5).
// Alle Schlüssel beginnen mit "johanniskreuz_" (bis 0.1.1 "pfalzturm_", die werden beim Start gelöscht). Abmelden löscht alle.

const VORSILBE = 'johanniskreuz_';

// Alte Schlüssel aus 0.1.x (Vorsilbe pfalzturm_) entfernen. Danach einmal neu anmelden.
try {
    Object.keys(localStorage).filter((k) => k.startsWith('pfalzturm_')).forEach((k) => localStorage.removeItem(k));
} catch (e) { /* kein Speicher */ }

export function lesen(name, ersatz = null) {
    try {
        const wert = localStorage.getItem(VORSILBE + name);
        return wert === null ? ersatz : JSON.parse(wert);
    } catch (e) {
        return ersatz;
    }
}

export function schreiben(name, wert) {
    try {
        localStorage.setItem(VORSILBE + name, JSON.stringify(wert));
        return true;
    } catch (e) {
        return false;
    }
}

// Löscht alles, was die App in diesem Gerät gespeichert hat.
export function abmelden() {
    try {
        Object.keys(localStorage)
            .filter((k) => k.startsWith(VORSILBE))
            .forEach((k) => localStorage.removeItem(k));
        return true;
    } catch (e) {
        return false;
    }
}

export function istAngemeldet() {
    return Boolean(lesen('passwort'));
}
