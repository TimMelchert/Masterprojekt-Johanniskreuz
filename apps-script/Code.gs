// =====================================================
// MASTERPROJEKT JOHANNISKREUZ – Apps Script (Gruppe, mit Passwort)
// Gebunden an das Google Sheet der Gruppe im Konto der Person.
// Bereitstellen als Web-App: Ausführen als „Ich“, Zugriff „Jeder“.
// Das Passwort steht NICHT hier, sondern in den Skripteigenschaften (APP_PIN).
// Ohne richtiges Passwort gibt das Skript keine Daten heraus.
// Siehe docs/STAND.md 2.2 und 2.3, Etappe 1: docs/PLAN-ETAPPE-1.md.
// =====================================================

// --- 0. AUFBAU DER BLÄTTER ---

// Vor jedem Daten-Blatt stehen diese Spalten.
var STANDARD_ = ["id", "erstellt_am", "geaendert_am", "geloescht"];

var STATUS_ = ["offen", "in_arbeit", "erledigt"];
// Farben der Arbeitsschritte (Kennungen; die Farbwerte stehen in css/base.css)
var FARBEN_ = ["gruen", "blau", "orange", "gelb", "rosa", "lila", "tuerkis", "grau"];

// Felder je Blatt, die die App schreiben darf. Reihenfolge = Spalten im Sheet (nach STANDARD_).
// art: text (max = Höchstlänge), datum (JJJJ-MM-TT oder leer), wahl (werte), zahl, wahr (ja/nein), bezug (id in einem anderen Blatt)
var FELDER_ = {
  arbeitsschritte: {
    titel: { art: "text", max: 120, pflicht: true },
    farbe: { art: "wahl", werte: FARBEN_ },
    start: { art: "datum" },
    ende: { art: "datum" },
    status: { art: "wahl", werte: STATUS_ },
    reihenfolge: { art: "zahl" },
    beschreibung: { art: "text", max: 2000 }
  },
  unterpunkte: {
    arbeitsschritt_id: { art: "bezug", blatt: "arbeitsschritte", pflicht: true },
    titel: { art: "text", max: 120, pflicht: true },
    start: { art: "datum" },
    ende: { art: "datum" },
    status: { art: "wahl", werte: STATUS_ },
    reihenfolge: { art: "zahl" },
    beschreibung: { art: "text", max: 2000 }
  },
  todos: {
    unterpunkt_id: { art: "bezug", blatt: "unterpunkte" },
    titel: { art: "text", max: 200, pflicht: true },
    wer: { art: "text", max: 200 },
    faellig: { art: "datum" },
    erledigt: { art: "wahr" },
    erledigt_am: { art: "datum", nurSkript: true },
    notiz: { art: "text", max: 2000 }
  },
  meilensteine: {
    titel: { art: "text", max: 120, pflicht: true },
    datum: { art: "datum", pflicht: true },
    beschreibung: { art: "text", max: 2000 }
  }
};

// Blätter für spätere Etappen (noch ohne Aktionen in der App)
var SPAETER_ = {
  termine: ["titel", "organisation", "datum", "uhrzeit", "ort", "personen"],
  akteure: ["name", "typ", "feld", "einfluss", "interesse", "notiz"],
  beziehungen: ["von", "nach", "art", "staerke", "quelle"]
};

var MIN_PIN_LAENGE_ = 12;

function kopf_(name) {
  if (name === "einstellungen") return ["schluessel", "wert"];
  var felder = FELDER_[name] ? Object.keys(FELDER_[name]) : SPAETER_[name];
  return STANDARD_.concat(felder);
}

// --- 1. EINRICHTEN (im Editor einmal ausführen, auch nach einem Update) ---

// Legt fehlende Blätter an und ergänzt fehlende Spalten am Ende. Vorhandene Daten bleiben unverändert.
// Text- und Datumsspalten werden als reiner Text formatiert (sonst macht das Sheet aus „2026-11-13“ ein Datum).
function einrichten() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var namen = Object.keys(FELDER_).concat(Object.keys(SPAETER_)).concat(["einstellungen"]);
  namen.forEach(function (name) {
    var kopf = kopf_(name);
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, kopf.length).setValues([kopf]).setFontWeight("bold");
      sheet.setFrozenRows(1);
      Logger.log("Blatt '" + name + "' angelegt.");
    } else {
      var sp = spalten_(sheet);
      var fehlen = kopf.filter(function (k) { return sp[k] == null; });
      if (fehlen.length) {
        sheet.getRange(1, sheet.getLastColumn() + 1, 1, fehlen.length).setValues([fehlen]).setFontWeight("bold");
        Logger.log("Blatt '" + name + "': Spalten ergänzt: " + fehlen.join(", "));
      } else {
        Logger.log("Blatt '" + name + "' ist vollständig.");
      }
    }
    if (FELDER_[name]) {
      var karte = spalten_(sheet);
      var felder = FELDER_[name];
      Object.keys(felder).concat(["id"]).forEach(function (k) {
        var art = felder[k] ? felder[k].art : "text";
        if (art === "text" || art === "datum" || art === "bezug" || k === "id") {
          sheet.getRange(2, karte[k] + 1, Math.max(sheet.getMaxRows() - 1, 1), 1).setNumberFormat("@");
        }
      });
    }
  });

  if (ss.getSheetByName("aufgaben")) {
    Logger.log("Hinweis: Das Blatt 'aufgaben' aus Version 0.1 wird nicht mehr gebraucht. Du kannst es löschen, wenn es leer ist.");
  }

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

// Macht aus Freitext einen sicheren Zellinhalt: Länge begrenzt, keine Formeln (=, +, -, @ am Anfang).
// Zeilenumbrüche bleiben nur, wenn mehrzeilig = true (Beschreibung, Notiz).
function bereinigeText_(text, maxLaenge, mehrzeilig) {
  var t = String(text == null ? "" : text);
  t = mehrzeilig ? t.replace(/\r\n?/g, "\n").replace(/[\t]+/g, " ") : t.replace(/[\r\n\t]+/g, " ");
  t = t.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim();
  if (t.length > maxLaenge) t = t.substring(0, maxLaenge);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

// Gegenstück beim Lesen: Das Hochkomma vor =, +, -, @ zeigt die App nicht.
function ohneSchutz_(v) {
  var t = String(v == null ? "" : v);
  return /^'[=+\-@]/.test(t) ? t.substring(1) : t;
}

// Spaltennummer (ab 0) je Name aus der Kopfzeile
function spalten_(sheet) {
  var lastCol = sheet.getLastColumn();
  var kopf = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var karte = {};
  kopf.forEach(function (h, i) { karte[String(h).trim().toLowerCase()] = i; });
  return karte;
}

function blatt_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error("Blatt '" + name + "' fehlt. Bitte im Editor einmal 'einrichten' ausführen.");
  return sheet;
}

function zeilen_(sheet) {
  return sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues() : [];
}

function istWahr_(v) {
  return v === true || /^(true|wahr|ja|x|1)$/i.test(String(v).trim());
}

// Datum aus dem Sheet als JJJJ-MM-TT (oder leer)
function tag_(v) {
  if (v instanceof Date && !isNaN(v)) return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var t = String(v == null ? "" : v).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : "";
}

// Zeitstempel als Text auf die Sekunde. Dient beim Ändern als Schutz vor Überschreiben.
function stempel_(v) {
  if (v instanceof Date && !isNaN(v)) return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
  return String(v == null ? "" : v).trim();
}

// Jetzt, auf ganze Sekunden gekürzt, mindestens eine Sekunde nach dem alten Stempel.
function jetzt_(alt) {
  var t = Math.floor(Date.now() / 1000) * 1000;
  if (alt instanceof Date && !isNaN(alt) && t <= alt.getTime()) t = Math.floor(alt.getTime() / 1000) * 1000 + 1000;
  return new Date(t);
}

function heute_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

// Zeile mit dieser id (nicht gelöscht) oder null
function finde_(sheet, sp, id) {
  if (!id) return null;
  var z = zeilen_(sheet);
  for (var i = 0; i < z.length; i++) {
    if (String(z[i][sp.id]) === id && !istWahr_(z[i][sp.geloescht])) return { zeile: z[i], nr: i + 2 };
  }
  return null;
}

// Eine Zeile als Objekt für die App
function eintragAus_(name, z, sp) {
  var felder = FELDER_[name];
  var o = { id: String(z[sp.id]), geaendert_am: stempel_(z[sp.geaendert_am]) };
  Object.keys(felder).forEach(function (k) {
    var v = sp[k] != null ? z[sp[k]] : "";
    var art = felder[k].art;
    if (art === "datum") o[k] = tag_(v);
    else if (art === "wahr") o[k] = istWahr_(v);
    else if (art === "zahl") o[k] = String(v).trim() === "" || !isFinite(Number(v)) ? null : Number(v);
    else if (art === "text") o[k] = ohneSchutz_(v);
    else o[k] = String(v == null ? "" : v).trim();
  });
  return o;
}

// Prüft die Felder aus der App. Ergebnis: { werte } oder { fehler }.
// teil = true: nur die mitgeschickten Felder prüfen (Ändern), sonst alle (Neu).
function pruefeEingabe_(name, daten, teil) {
  var felder = FELDER_[name];
  var werte = {};
  var namen = Object.keys(felder);
  for (var i = 0; i < namen.length; i++) {
    var k = namen[i];
    var f = felder[k];
    if (f.nurSkript) continue;
    if (teil && !(k in daten)) continue;
    var v = daten[k];
    var leer = v == null || String(v).trim() === "";
    if (f.pflicht && leer) return { fehler: "Bitte „" + k + "“ ausfüllen." };
    if (f.art === "text") {
      werte[k] = bereinigeText_(v, f.max, f.max > 200);
    } else if (f.art === "datum") {
      var t = leer ? "" : String(v).trim();
      if (t && !/^\d{4}-\d{2}-\d{2}$/.test(t)) return { fehler: "Ungültiges Datum bei „" + k + "“." };
      werte[k] = t;
    } else if (f.art === "wahl") {
      var w = leer ? f.werte[0] : String(v).trim();
      if (f.werte.indexOf(w) < 0) return { fehler: "Ungültiger Wert bei „" + k + "“." };
      werte[k] = w;
    } else if (f.art === "zahl") {
      if (leer) { werte[k] = ""; continue; }
      var n = Number(v);
      if (!isFinite(n) || Math.abs(n) > 100000) return { fehler: "Ungültige Zahl bei „" + k + "“." };
      werte[k] = n;
    } else if (f.art === "wahr") {
      werte[k] = v === true;
    } else if (f.art === "bezug") {
      var id = leer ? "" : String(v).trim();
      if (id && !finde_(blatt_(f.blatt), spalten_(blatt_(f.blatt)), id)) {
        return { fehler: "Der zugehörige Eintrag („" + k + "“) existiert nicht mehr. Bitte neu laden." };
      }
      werte[k] = id;
    }
  }
  return { werte: werte };
}

// --- 3. AKTIONEN ---

// Alle Daten für Arbeitsschritte, ToDos und Gantt auf einmal (ohne gelöschte)
function liste_() {
  var out = {};
  Object.keys(FELDER_).forEach(function (name) {
    var sheet = blatt_(name);
    var sp = spalten_(sheet);
    out[name] = zeilen_(sheet)
      .filter(function (z) { return String(z[sp.id]).trim() && !istWahr_(z[sp.geloescht]); })
      .map(function (z) { return eintragAus_(name, z, sp); });
  });
  return out;
}

// Neu (ohne id) oder ändern (mit id und geaendert_am als Schutz vor Überschreiben)
function speichern_(data) {
  var name = String(data.blatt || "");
  if (!FELDER_[name]) return { error: "eingabe", message: "Unbekanntes Blatt." };
  var daten = data.daten || {};
  var neu = !daten.id;
  var p = pruefeEingabe_(name, daten, !neu);
  if (p.fehler) return { error: "eingabe", message: p.fehler };

  var sheet = blatt_(name);
  var sp = spalten_(sheet);
  var fehlen = kopf_(name).filter(function (k) { return sp[k] == null; });
  if (fehlen.length) return { error: "blatt", message: "Spalten fehlen in '" + name + "': " + fehlen.join(", ") + ". Bitte im Editor 'einrichten' ausführen." };

  var breite = sheet.getLastColumn();
  var zeile, nr;
  if (neu) {
    zeile = new Array(breite).fill("");
    zeile[sp.id] = Utilities.getUuid();
    zeile[sp.geloescht] = false;
    nr = sheet.getLastRow() + 1;
  } else {
    var gefunden = finde_(sheet, sp, String(daten.id));
    if (!gefunden) return { error: "fehlt", message: "Diesen Eintrag gibt es nicht mehr. Bitte neu laden." };
    zeile = gefunden.zeile;
    nr = gefunden.nr;
    if (stempel_(zeile[sp.geaendert_am]) !== String(daten.geaendert_am || "")) {
      return { error: "geaendert", message: "Jemand hat diesen Eintrag inzwischen geändert. Bitte neu laden und noch einmal versuchen." };
    }
  }

  // Erledigt am: setzt das Skript selbst
  if (name === "todos" && "erledigt" in p.werte) {
    var vorher = !neu && istWahr_(zeile[sp.erledigt]);
    if (p.werte.erledigt && !vorher) p.werte.erledigt_am = heute_();
    if (!p.werte.erledigt) p.werte.erledigt_am = "";
  }

  // Ende nicht vor dem Start (auch beim Ändern nur eines der beiden Felder)
  if (sp.start != null && sp.ende != null) {
    var start = "start" in p.werte ? p.werte.start : tag_(zeile[sp.start]);
    var ende = "ende" in p.werte ? p.werte.ende : tag_(zeile[sp.ende]);
    if (start && ende && ende < start) return { error: "eingabe", message: "Das Ende liegt vor dem Start." };
  }

  var jetzt = jetzt_(zeile[sp.geaendert_am]);
  if (!zeile[sp.erstellt_am]) zeile[sp.erstellt_am] = jetzt;
  Object.keys(p.werte).forEach(function (k) { zeile[sp[k]] = p.werte[k]; });
  zeile[sp.geaendert_am] = jetzt;
  sheet.getRange(nr, 1, 1, breite).setValues([zeile]);

  return { eintrag: eintragAus_(name, sheet.getRange(nr, 1, 1, breite).getValues()[0], sp) };
}

// ToDo abhaken oder zurücknehmen (ohne Schutz vor Überschreiben: Haken setzen ist eindeutig)
function abhaken_(data) {
  var sheet = blatt_("todos");
  var sp = spalten_(sheet);
  var gefunden = finde_(sheet, sp, String(data.id || ""));
  if (!gefunden) return { error: "fehlt", message: "Dieses ToDo gibt es nicht mehr. Bitte neu laden." };
  var wert = data.wert === true;
  var breite = sheet.getLastColumn();
  var zeile = gefunden.zeile;
  zeile[sp.erledigt] = wert;
  zeile[sp.erledigt_am] = wert ? heute_() : "";
  zeile[sp.geaendert_am] = jetzt_(zeile[sp.geaendert_am]);
  sheet.getRange(gefunden.nr, 1, 1, breite).setValues([zeile]);
  return { eintrag: eintragAus_("todos", zeile, sp) };
}

// Weich löschen: setzt geloescht = TRUE (im Sheet zurückholbar).
// Arbeitsschritt: auch seine Unterpunkte und deren ToDos. Unterpunkt: auch seine ToDos.
function loeschen_(data) {
  var name = String(data.blatt || "");
  if (!FELDER_[name]) return { error: "eingabe", message: "Unbekanntes Blatt." };
  var sheet = blatt_(name);
  var sp = spalten_(sheet);
  var id = String(data.id || "");
  if (!finde_(sheet, sp, id)) return { error: "fehlt", message: "Diesen Eintrag gibt es nicht mehr. Bitte neu laden." };

  var geloescht = { arbeitsschritte: [], unterpunkte: [], todos: [] };
  geloescht[name] = [id];
  if (name === "arbeitsschritte") geloescht.unterpunkte = kinder_("unterpunkte", "arbeitsschritt_id", [id]);
  if (name === "arbeitsschritte" || name === "unterpunkte") {
    geloescht.todos = kinder_("todos", "unterpunkt_id", name === "unterpunkte" ? [id] : geloescht.unterpunkte);
  }
  Object.keys(geloescht).forEach(function (b) {
    if (geloescht[b].length) markiereGeloescht_(b, geloescht[b]);
  });
  return { geloescht: geloescht, blatt: name, id: id };
}

// ids aller nicht gelöschten Zeilen, deren Spalte `spalte` eine der eltern-ids enthält
function kinder_(name, spalte, eltern) {
  var sheet = blatt_(name);
  var sp = spalten_(sheet);
  return zeilen_(sheet)
    .filter(function (z) { return !istWahr_(z[sp.geloescht]) && eltern.indexOf(String(z[sp[spalte]])) >= 0; })
    .map(function (z) { return String(z[sp.id]); });
}

function markiereGeloescht_(name, ids) {
  var sheet = blatt_(name);
  var sp = spalten_(sheet);
  var z = zeilen_(sheet);
  for (var i = 0; i < z.length; i++) {
    if (ids.indexOf(String(z[i][sp.id])) >= 0 && !istWahr_(z[i][sp.geloescht])) {
      sheet.getRange(i + 2, sp.geloescht + 1).setValue(true);
      sheet.getRange(i + 2, sp.geaendert_am + 1).setValue(jetzt_(z[i][sp.geaendert_am]));
    }
  }
}

// --- 4. SCHNITTSTELLE ---

function doGet() {
  return jsonOut_({ status: "Johanniskreuz API" });
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
    if (data.action === "liste") return jsonOut_(liste_());

    if (data.action === "speichern" || data.action === "loeschen" || data.action === "abhaken") {
      // Sperre: Es kann immer nur ein Schreibzugriff gleichzeitig laufen
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(20000)) {
        return jsonOut_({ error: "ausgelastet", message: "Das Skript ist gerade beschäftigt. Bitte gleich noch einmal versuchen." });
      }
      try {
        if (data.action === "speichern") return jsonOut_(speichern_(data));
        if (data.action === "loeschen") return jsonOut_(loeschen_(data));
        return jsonOut_(abhaken_(data));
      } finally {
        lock.releaseLock();
      }
    }

    return jsonOut_({ error: "aktion", message: "Unbekannte Aktion" });
  } catch (err) {
    return jsonOut_({ error: "server", message: "Fehler im Skript: " + String(err && err.message || err) });
  }
}
