// Masterprojekt Johanniskreuz – Einstellungen im Code
// Hier steht KEIN Passwort. Das Passwort steht nur in den Skripteigenschaften (APP_PIN) und im Gerät nach der Anmeldung.

// Muss exakt gleich sein wie VERSION in sw.js.
export const VERSION = '0.2.1';

// Adresse des Google Apps Scripts (Web-App, endet auf /exec). Kein Geheimnis: Ohne Passwort gibt das Skript nichts heraus.
export const API_URL = 'https://script.google.com/macros/s/AKfycbypg3uMEsMjK_yhhCZwgSvTV94te0wIxIc6khdte5k0hl0UAWNL3bCR8RG1RexZlyGj/exec';

// Welche Bereiche sichtbar sind. false = Bereich wird ausgeblendet.
export const features = {
    karten: true,
    zeitplan: true,
    arbeitsschritte: true,
    todos: true,
    akteure: true
};

// Bereiche in der Reihenfolge der Leiste. etappe = in welcher Etappe der Inhalt kommt (bis dahin Platzhalter).
// feld = Themenfarbe aus dem Projekt-Cockpit (A bis G), siehe css/base.css.
export const BEREICHE = [
    { id: 'karten',          titel: 'Karten',          kurz: 'Karten',  feld: 'a', etappe: 2, text: 'Interaktive Karten und Pläne mit Ebenen.' },
    { id: 'zeitplan',        titel: 'Zeitplan',        kurz: 'Zeitplan', feld: 'g', etappe: 1, text: 'Phasen und Meilensteine als Gantt-Diagramm.' },
    { id: 'arbeitsschritte', titel: 'Arbeitsschritte', kurz: 'Schritte', feld: 'd', etappe: 1, text: 'Zeitstrahl der Arbeitsschritte mit Unterpunkten und Meilensteinen.' },
    { id: 'todos',           titel: 'ToDos',           kurz: 'ToDos',   feld: 'b', etappe: 1, text: 'Alle ToDos zum Abhaken, filterbar nach Person.' },
    { id: 'akteure',         titel: 'Akteursnetz',     kurz: 'Akteure', feld: 'c', etappe: 3, text: 'Wer ist beteiligt, wie hängen alle zusammen?' }
];

// Themenfelder aus dem Projekt-Cockpit. Gleiche Farben wie an der Wand und im Cockpit.
export const FELDER = [
    { id: 'a', titel: 'Raum & Ökologie' },
    { id: 'b', titel: 'Recht & Planung' },
    { id: 'c', titel: 'Akteure & Governance' },
    { id: 'd', titel: 'Tourismus & Regionalentwicklung' },
    { id: 'e', titel: 'Turm & Alternativen' },
    { id: 'f', titel: 'Theorie / kritische Landforschung' },
    { id: 'g', titel: 'Organisation' }
];
