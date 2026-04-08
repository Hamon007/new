export const CASE_1 = {
  id: "case_01_white_hour",
  title: "Die weisse Stunde",
  runtime: "1-2h",
  briefing: {
    summary:
      "Ein Informant verschwindet nach einer Routine-Uebergabe im Berliner Regierungsviertel. Die erste Lage wirkt wie Flucht, aber mehrere Signale deuten auf eine inszenierte Umlenkung hin.",
    objective:
      "Erstelle eine belastbare These: Wer hat die Operation vorbereitet, welches Alibi wurde gebaut und warum ist die offizielle Zeitlinie fehlerhaft?",
    constraints: [
      "72 Minuten bis zur politischen Pressebewertung",
      "Lokale Behoerden nur eingeschraenkt einbindbar",
      "Ein kritischer Datentraeger darf nicht oeffentlich werden"
    ]
  },
  linkTypes: [
    "bestaetigt",
    "widerspricht",
    "ermoeglichte",
    "manipulierte",
    "verschleierte",
    "beobachtete"
  ],
  nodes: [
    {
      id: "p_informant",
      type: "Person",
      label: "Elias Dorn",
      detail: "Vermisster Informant mit Zugang zu Beschaffungsdaten.",
      trust: "B",
      time: "20:02",
      source: "Internes Dossier"
    },
    {
      id: "p_liaison",
      type: "Person",
      label: "Leonie Voss",
      detail: "Verbindungsoffizierin; fuehrte letzte Kontaktaufnahme.",
      trust: "C",
      time: "19:50",
      source: "Dienstplan / Einsatzchat"
    },
    {
      id: "p_driver",
      type: "Person",
      label: "Noah Krell",
      detail: "Fahrer eines nicht markierten Transporters.",
      trust: "D",
      time: "20:08",
      source: "Zeugenhinweis"
    },
    {
      id: "l_hotel",
      type: "Ort",
      label: "Hotel Atrium",
      detail: "Offizielles Alibi fuer Dorn zur kritischen Zeit.",
      trust: "C",
      time: "20:10",
      source: "Hotellog / Kamera"
    },
    {
      id: "l_tunnel",
      type: "Ort",
      label: "Servicetunnel Nord",
      detail: "Blindstelle zwischen Uebergabepunkt und Ausfahrt.",
      trust: "B",
      time: "20:06",
      source: "Objektskizze"
    },
    {
      id: "e_cctv_shift",
      type: "Ereignis",
      label: "CCTV Zeitversatz +11 Min",
      detail: "Kameraserver wurde kurz vor Ereignis synchronisiert.",
      trust: "A",
      time: "19:57",
      source: "Forensik-Bericht"
    },
    {
      id: "e_keycard",
      type: "Ereignis",
      label: "Keycard-Login Tunnel",
      detail: "Leonie Voss Karte oeffnete Tunnelzugang.",
      trust: "A",
      time: "20:04",
      source: "Zutrittsprotokoll"
    },
    {
      id: "o_drive",
      type: "Objekt",
      label: "Verschluesselter Datentraeger",
      detail: "Nicht auffindbar; enthaelt Segment Delta/214.",
      trust: "B",
      time: "Unklar",
      source: "Uebergabeprotokoll"
    },
    {
      id: "s_witness",
      type: "Aussage",
      label: "Zeugin M. Arendt",
      detail: "Sah Dorn nicht im Hotel, sondern am Lieferhof.",
      trust: "D",
      time: "20:09",
      source: "Telefonprotokoll"
    },
    {
      id: "e_radio",
      type: "Ereignis",
      label: "Funkphrase \"weisse Stunde\"",
      detail: "Kurzer Funkspruch kurz nach Tunneloeffnung.",
      trust: "C",
      time: "20:05",
      source: "Abgefangener Mitschnitt"
    }
  ],
  timeline: [
    { time: "19:50", text: "Leonie Voss startet Kontaktkette mit Informant Dorn." },
    { time: "19:57", text: "CCTV-Server bekommt ungeplantes Zeitupdate (+11 Min)." },
    { time: "20:02", text: "Geplante Uebergabe am Regierungsring." },
    { time: "20:04", text: "Tunnelzugang wird mit Voss-Card geoeffnet." },
    { time: "20:05", text: "Funkphrase \"weisse Stunde\" auf Kanal 4." },
    { time: "20:08", text: "Transporter ohne Kennung verlaesst Nebenausfahrt." },
    { time: "20:10", text: "Hotelkamera zeigt Dorn am Check-in (mutmasslich verschoben)." }
  ],
  operations: [
    {
      id: "op_witness_protect",
      label: "Zeugin M. Arendt in Schutzprogramm ueberfuehren",
      effect: { reliability: 12, pressure: 8, risk: 4 },
      unlockAnalysis:
        "Zeugin bestaetigt: Transporter fuhr aus Tunnel, nicht aus Hotelzufahrt."
    },
    {
      id: "op_fast_access",
      label: "Sofortzugriff auf Tunnelserver (ohne Freigabe)",
      effect: { reliability: 16, pressure: -6, risk: 13 },
      unlockAnalysis:
        "Serverlog zeigt manuelle Zeitsynchronisation mit Voss-Token."
    },
    {
      id: "op_hold_and_tail",
      label: "Verdaechtigen Fahrer weiter beobachten statt zugreifen",
      effect: { reliability: 7, pressure: 14, risk: -2 },
      unlockAnalysis:
        "Noah Krell trifft einen unbekannten Kurier, Datentraeger bleibt verschwunden."
    }
  ],
  suspects: [
    { id: "sus_voss", name: "Leonie Voss", isMain: true },
    { id: "sus_krell", name: "Noah Krell", isMain: false },
    { id: "sus_dorn", name: "Elias Dorn (Selbstinszenierung)", isMain: false }
  ],
  requiredLinks: [
    {
      a: "e_cctv_shift",
      b: "l_hotel",
      type: "manipulierte",
      hint: "Hotelalibi ist nur mit Zeitversatz plausibel."
    },
    {
      a: "e_keycard",
      b: "p_liaison",
      type: "bestaetigt",
      hint: "Zutritt mit Karte von Voss ist harte Evidenz."
    },
    {
      a: "p_informant",
      b: "l_tunnel",
      type: "ermoeglichte",
      hint: "Fluchtroute lief ueber den Tunnelkorridor."
    },
    {
      a: "e_radio",
      b: "e_keycard",
      type: "bestaetigt",
      hint: "\"Weisse Stunde\" folgt direkt auf die Tunneloeffnung."
    }
  ],
  debriefTruth: {
    culprit: "sus_voss",
    summary:
      "Leonie Voss baute mit Zeitmanipulation und Tunnelzugriff ein falsches Hotelalibi. Dorn war Mitwisser, aber nicht Taktgeber. Der Datentraeger blieb absichtlich in der Schattenkette."
  }
};
