// =====================================================
// PFALZTURM – Apps Script (Gruppe, mit Passwort)
// Gebunden an das Google Sheet „Pfalzturm“ im Konto der Person.
// Bereitstellen als Web-App: Ausführen als „Ich“, Zugriff „Jeder“.
// Das Passwort steht NICHT hier, sondern in den Skripteigenschaften (APP_PIN).
// Ohne richtiges Passwort gibt das Skript keine Daten heraus.
// Siehe docs/STAND.md 2.2 und 2.3.
// =====================================================

// Blätter mit ihren Spalten (Zeile 1). Neue Spalten nur am Ende ergänzen, nie umbenennen (docs/STAND.md 1.2, Punkt 4).
// Die Spalten der Daten-Blätter können sich in ihrer Etappe noch ändern; einrichten() ergänzt dann fehlende.
var STANDARD_ = ["id", "erstellt_am", "geaendert_am", "geloescht"];
var BLAETTER_ = {
  aufgaben: ["titel", "feld", "wer", "start", "ende", "status", "uebergeordnet", "abhaengig_von", "meilenstein"],
  termine: ["titel", "organisation", "datum", "uhrzeit", "ort", "personen"],
  akteure: ["name", "typ", "feld", "einfluss", "interesse", "notiz"],
  beziehungen: ["von", "nach", "art", "staerke", "quelle"],
  einstellungen: ["schluessel", "wert"]
};
var MIN_PIN_LAENGE_ = 12;

// --- 1. EINRICHTEN (im Editor einmal ausführen, auch nach einem Update) ---

// Legt fehlende Blätter an und ergänzt fehlende Spalten am Ende. Vorhandene Daten bleiben unverändert.
function einrichten() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(BLAETTER_).forEach(function (name) {
    var kopf = name === "einstellungen" ? BLAETTER_[name] : STANDARD_.concat(BLAETTER_[name]);
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, kopf.length).setValues([kopf]).setFontWeight("bold");
      sheet.setFrozenRows(1);
      Logger.log("Blatt '" + name + "' angelegt.");
      return;
    }
    var sp = spalten_(sheet);
    var fehlen = kopf.filter(function (k) { return sp[k] == null; });
    if (fehlen.length) {
      sheet.getRange(1, sheet.getLastColumn() + 1, 1, fehlen.length).setValues([fehlen]).setFontWeight("bold");
      Logger.log("Blatt '" + name + "': Spalten ergänzt: " + fehlen.join(", "));
    } else {
      Logger.log("Blatt '" + name + "' ist vollständig.");
    }
  });

  var pin = PropertiesService.getScriptProperties().getProperty("APP_PIN");
  if (!pin) {
    Logger.log("ACHTUNG: Skripteigenschaft APP_PIN fehlt. Bitte unter Projekteinstellungen → Skripteigenschaften anlegen.");
  } else if (pin.length < MIN_PIN_LAENGE_) {
    Logger.log("ACHTUNG: APP_PIN ist kürzer als " + MIN_PIN_LAENGE_ + " Zeichen. Bitte ein längeres Passwort wählen.");
  } else {
    Logger.log("APP_PIN ist gesetzt.");
  }
  Logger.log("Fertig.");
}

// --- 2. HILFSFUNKTIONEN ---

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Prüft das Passwort und sperrt nach 5 Fehlversuchen für 15 Minuten.
function pruefePin_(pin) {
  var cache = CacheService.getScriptCache();
  var fehler = Number(cache.get("pin_fehler") || 0);
  if (fehler >= 5) return "gesperrt";

  var soll = PropertiesService.getScriptProperties().getProperty("APP_PIN");
  if (!soll || soll.length < MIN_PIN_LAENGE_ || String(pin) !== soll) {
    cache.put("pin_fehler", String(fehler + 1), 900);
    return "falsch";
  }
  cache.remove("pin_fehler");
  return "ok";
}

// Macht aus Freitext einen sicheren Zellinhalt: Zeilenumbrüche weg, Länge begrenzt, keine Formeln.
// Wird ab Etappe 1 beim Schreiben gebraucht.
function bereinigeText_(text, maxLaenge) {
  var t = String(text == null ? "" : text).replace(/[\r\n\t]+/g, " ").trim();
  if (t.length > maxLaenge) t = t.substring(0, maxLaenge);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

// Spaltennummer (ab 0) je Name aus der Kopfzeile
function spalten_(sheet) {
  var lastCol = sheet.getLastColumn();
  var kopf = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var karte = {};
  kopf.forEach(function (h, i) { karte[String(h).trim().toLowerCase()] = i; });
  return karte;
}

// --- 3. SCHNITTSTELLE ---

function doGet() {
  return jsonOut_({ status: "Pfalzturm API" });
}

// Alle Anfragen laufen über POST und brauchen das Passwort.
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ error: "anfrage", message: "Ungültige Anfrage" });
  }

  var status = pruefePin_(data.pin);
  if (status === "gesperrt") {
    return jsonOut_({ error: "gesperrt", message: "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen." });
  }
  if (status !== "ok") {
    return jsonOut_({ error: "pin", message: "Passwort falsch" });
  }

  try {
    if (data.action === "ping") return jsonOut_({ ok: true });
    return jsonOut_({ error: "aktion", message: "Unbekannte Aktion" });
  } catch (err) {
    return jsonOut_({ error: "server", message: "Fehler im Skript. Bitte später erneut versuchen." });
  }
}
