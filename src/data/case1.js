export const CASE_1 = {
  caseId: "CASE-001",
  title: "Die weisse Stunde",
  subtitle: "Ein Vermisstenfall, der im Neonlicht beginnt und in einer Luecke in der Zeit endet.",
  estimatedPlaytimeMin: 75,
  difficulty: 1,
  tone: ["duester", "realistisch", "psychologisch", "spionage", "paranoid", "kinematografisch"],
  styleGuide: {
    visualMood: "Kaltes Neon, nasse Flaechen, harte Schatten, sterile Raeume.",
    narrativeMood: "Praezise, nervoes, moralisch grau, langsam eskalierend.",
    playerFantasy:
      "Der Spieler rekonstruiert eine Wahrheit, die jemand absichtlich in Einzelteile zerlegt hat."
  },
  coreTruth: {
    short:
      "Jonah Hale wurde nicht klassisch entfuehrt, sondern kontrolliert uebergeben. Die Spur wurde zeitlich manipuliert, um eine falsche Entfuehrung zu inszenieren."
  },
  determinism: {
    endingPriority: ["END_A", "END_B", "END_D", "END_C"],
    categoryPriority: {
      progress: 1,
      evidence: 2,
      analysis: 3,
      relationship: 2,
      state: 2,
      truth: 5,
      meta: 1,
      fail: 4
    },
    conflicts: [
      ["truth_timeManipulated_confirmed", "fail_timeIgnored"],
      ["truth_van_redHerring", "fail_redHerringFollowed"],
      ["truth_mara_involved", "fail_maraPrematurelyCondemned"]
    ],
    fallbackEndingId: "END_C"
  },
  staffelHint: {
    id: "S-HINT-001",
    text: "Der Schnitt im Symbol ist kein Zeichen. Er ist ein Schnittpunkt.",
    revealedByEnding: "END_A"
  },
  flags: [
    { id: "briefingAccepted", category: "progress" },
    { id: "caseOpened", category: "progress" },
    { id: "clue_jonahFile_seen", category: "evidence" },
    { id: "clue_lastCall_seen", category: "evidence" },
    { id: "clue_cctv_seen", category: "evidence" },
    { id: "clue_mara_lastContact_seen", category: "evidence" },
    { id: "clue_parkingTicket_found", category: "evidence" },
    { id: "clue_skyshadow_analyzed", category: "analysis" },
    { id: "clue_emil_statement_taken", category: "evidence" },
    { id: "clue_van_sighted", category: "evidence" },
    { id: "clue_whiteEnvelope_found", category: "evidence" },
    { id: "staffel_symbol_seen", category: "meta" },
    { id: "clue_tankReceipt_found", category: "evidence" },
    { id: "clue_whiteHour_note_found", category: "evidence" },
    { id: "clue_cashier_statement_taken", category: "evidence" },
    { id: "clue_wartungslog_found", category: "evidence" },
    { id: "clue_syncOffset_found", category: "analysis" },
    { id: "clue_noura_access_known", category: "evidence" },
    { id: "clue_ralfApproval_known", category: "evidence" },
    { id: "clue_fingerprint_found", category: "evidence" },
    { id: "clue_audioFragment_found", category: "evidence" },
    { id: "clue_note_noMaraBeforeTime_found", category: "evidence" },
    { id: "rel_emil_parkhaus", category: "relationship" },
    { id: "rel_emil_whiteflash", category: "relationship" },
    { id: "rel_jonah_mara", category: "relationship" },
    { id: "rel_mara_transfer", category: "relationship" },
    { id: "rel_noura_system", category: "relationship" },
    { id: "rel_noura_access", category: "relationship" },
    { id: "rel_ralf_access", category: "relationship" },
    { id: "rel_ralf_approval", category: "relationship" },
    { id: "hypothesis_kidnapping_forming", category: "state" },
    { id: "hypothesis_transfer_forming", category: "state" },
    { id: "hypothesis_timeManipulation_forming", category: "state" },
    { id: "hypothesis_maraComplicit_forming", category: "state" },
    { id: "hypothesis_internalAccess_forming", category: "state" },
    { id: "truth_transfer_confirmed", category: "truth" },
    { id: "truth_timeManipulated_confirmed", category: "truth" },
    { id: "truth_internalAccess_confirmed", category: "truth" },
    { id: "truth_mara_involved", category: "truth" },
    { id: "truth_van_redHerring", category: "truth" },
    { id: "staffel_cutpoint_hint", category: "meta" },
    { id: "fail_wrongMainSuspect", category: "fail" },
    { id: "fail_timeIgnored", category: "fail" },
    { id: "fail_redHerringFollowed", category: "fail" },
    { id: "fail_maraPrematurelyCondemned", category: "fail" }
  ],
  locations: [
    { id: "LOC-001", name: "Briefingraum", unlocksScenes: ["SCENE-001"] },
    { id: "LOC-002", name: "Parkhaus Nord", unlocksScenes: ["SCENE-002"] },
    { id: "LOC-003", name: "Tankstelle B7", unlocksScenes: ["SCENE-003"] },
    { id: "LOC-004", name: "Verwaltungsarchiv", unlocksScenes: ["SCENE-004"] },
    { id: "LOC-005", name: "Wohnung Jonah Hale", unlocksScenes: ["SCENE-005", "SCENE-006", "SCENE-007"] }
  ],
  hypotheses: [
    {
      id: "HYP-001",
      title: "Klassische Entfuehrung",
      summary: "Jonah wurde von externen Taetern am Parkhaus abgefangen.",
      isFalseLead: true,
      requiredFlags: ["clue_cctv_seen", "clue_van_sighted"],
      contradictedBy: [
        "clue_tankReceipt_found",
        "clue_syncOffset_found",
        "clue_parkingTicket_found",
        "clue_skyshadow_analyzed"
      ]
    },
    {
      id: "HYP-002",
      title: "Kontrollierte Uebergabe",
      summary: "Jonah wurde geplant uebergeben, nicht spontan entfuehrt.",
      isCoreTruth: true,
      requiredFlags: [
        "clue_lastCall_seen",
        "clue_tankReceipt_found",
        "clue_whiteHour_note_found",
        "truth_transfer_confirmed"
      ],
      strengthenedBy: [
        "clue_audioFragment_found",
        "clue_mara_lastContact_seen",
        "clue_note_noMaraBeforeTime_found"
      ]
    },
    {
      id: "HYP-003",
      title: "Zeitmanipulation",
      summary: "Die Kamerazeit wurde absichtlich verschoben.",
      isCoreSupport: true,
      requiredFlags: ["clue_parkingTicket_found", "clue_skyshadow_analyzed", "clue_syncOffset_found"],
      strengthenedBy: ["clue_wartungslog_found", "clue_emil_statement_taken"]
    },
    {
      id: "HYP-004",
      title: "Mara Voss ist beteiligt",
      summary: "Mara war Teil der Uebergabekette.",
      isCoreSupport: true,
      requiredFlags: ["clue_mara_lastContact_seen", "clue_whiteEnvelope_found", "clue_fingerprint_found"]
    },
    {
      id: "HYP-005",
      title: "Interner Zugriff als Ermmoeglicher",
      summary: "Manipulation war nur ueber internen Systemzugang moeglich.",
      isCoreSupport: true,
      requiredFlags: ["clue_wartungslog_found", "clue_noura_access_known", "clue_ralfApproval_known"]
    }
  ],
  clues: [
    {
      id: "CL-001",
      title: "Vermisstenakte Jonah Hale",
      locationId: "LOC-001",
      text: "Jonah Hale, 34, IT-Berater. In den letzten Tagen deutlich nervoeser.",
      revealsFlags: ["clue_jonahFile_seen"],
      supportsHypotheses: ["HYP-001", "HYP-002"],
      mandatory: true
    },
    {
      id: "CL-002",
      title: "Letzter Anruf 23:58",
      locationId: "LOC-001",
      text: "Eingehender Anruf 23:58:14 auf Geraete-ID JH-04, nicht angenommen.",
      revealsFlags: ["clue_lastCall_seen"],
      supportsHypotheses: ["HYP-002", "HYP-003"],
      contradictsHypotheses: ["HYP-001"],
      mandatory: true
    },
    {
      id: "CL-003",
      title: "CCTV-Still Parkhaus",
      locationId: "LOC-001",
      text: "Jonah betritt 23:51 den Eingang. Bild wirkt technisch sauber, zeitlich unsicher.",
      revealsFlags: ["clue_cctv_seen"],
      supportsHypotheses: ["HYP-001", "HYP-002"],
      mandatory: true
    },
    {
      id: "CL-004",
      title: "Mara als letzte Kontaktperson",
      locationId: "LOC-001",
      text: "Letzter Kontakt zu Mara Voss um 23:33.",
      revealsFlags: ["clue_mara_lastContact_seen"],
      supportsHypotheses: ["HYP-004", "HYP-002"],
      mandatory: true
    },
    {
      id: "CL-005",
      title: "Parkticket mit Druckfehler",
      locationId: "LOC-002",
      text: "Ticket zeigt minimale, unnatuerliche Druckverschiebung.",
      revealsFlags: ["clue_parkingTicket_found"],
      supportsHypotheses: ["HYP-003"],
      contradictsHypotheses: ["HYP-001"],
      mandatory: true
    },
    {
      id: "CL-006",
      title: "Schattenanalyse",
      locationId: "LOC-002",
      text: "Schattenrichtung passt nicht zur Wetterlage und Uhrzeit.",
      revealsFlags: ["clue_skyshadow_analyzed"],
      supportsHypotheses: ["HYP-003"],
      contradictsHypotheses: ["HYP-001"],
      mandatory: true
    },
    {
      id: "CL-007",
      title: "Aussage Emil Brandt",
      locationId: "LOC-002",
      text: "Es gab einen weissen Flackermoment. Lieferwagen gesehen, aber unsicher.",
      revealsFlags: ["clue_emil_statement_taken", "clue_van_sighted"],
      supportsHypotheses: ["HYP-003"],
      contradictsHypotheses: ["HYP-001"],
      mandatory: true
    },
    {
      id: "CL-008",
      title: "Leerer Umschlag mit weissem Symbol",
      locationId: "LOC-002",
      text: "Kreis mit senkrechtem Schnitt, kein Inhalt.",
      revealsFlags: ["clue_whiteEnvelope_found", "staffel_symbol_seen"],
      supportsHypotheses: ["HYP-004"],
      mandatory: true
    },
    {
      id: "CL-009",
      title: "Tankstellenbeleg 23:39",
      locationId: "LOC-003",
      text: "Jonah war vor dem Parkhaus an der Tankstelle.",
      revealsFlags: ["clue_tankReceipt_found"],
      supportsHypotheses: ["HYP-002", "HYP-003"],
      contradictsHypotheses: ["HYP-001"],
      mandatory: true
    },
    {
      id: "CL-010",
      title: "Notiz: Die weisse Stunde",
      locationId: "LOC-003",
      text: "Wenn du die weisse Stunde nimmst, geht es sauber.",
      revealsFlags: ["clue_whiteHour_note_found"],
      supportsHypotheses: ["HYP-002"],
      mandatory: true
    },
    {
      id: "CL-011",
      title: "Aussage Nachtschicht",
      locationId: "LOC-003",
      text: "Jonah wirkte ruhig, aber angespannt. Nicht panisch.",
      revealsFlags: ["clue_cashier_statement_taken"],
      supportsHypotheses: ["HYP-002"],
      mandatory: false
    },
    {
      id: "CL-012",
      title: "Wartungslog / Zugriffsliste",
      locationId: "LOC-004",
      text: "Fenster 23:44-00:04, formal sauber, inhaltlich verdaechtig.",
      revealsFlags: ["clue_wartungslog_found", "clue_ralfApproval_known"],
      supportsHypotheses: ["HYP-005", "HYP-003"],
      contradictsHypotheses: ["HYP-001"],
      mandatory: true
    },
    {
      id: "CL-013",
      title: "13-Minuten-Synchronisationsversatz",
      locationId: "LOC-004",
      text: "Kamera lief 13 Minuten vor. Bild echt, Zeitstempel falsch.",
      revealsFlags: ["clue_syncOffset_found", "truth_timeManipulated_confirmed"],
      supportsHypotheses: ["HYP-003", "HYP-005"],
      contradictsHypotheses: ["HYP-001"],
      mandatory: true
    },
    {
      id: "CL-014",
      title: "Noura mit Systemzugriff",
      locationId: "LOC-004",
      text: "Temporare Adminrechte auf Synchronisationsmodule.",
      revealsFlags: ["clue_noura_access_known", "rel_noura_system", "rel_noura_access"],
      supportsHypotheses: ["HYP-005"],
      mandatory: true
    },
    {
      id: "CL-015",
      title: "Fingerabdruck auf Umschlag",
      locationId: "LOC-005",
      text: "Teilabdruck, kein Match zu Jonah.",
      revealsFlags: ["clue_fingerprint_found"],
      supportsHypotheses: ["HYP-004", "HYP-005"],
      mandatory: false
    },
    {
      id: "CL-016",
      title: "Audiofragment aus Jonahs Geraet",
      locationId: "LOC-005",
      text: "Wenn du die weisse Stunde nimmst, geht es sauber.",
      revealsFlags: ["clue_audioFragment_found"],
      supportsHypotheses: ["HYP-002", "HYP-003"],
      mandatory: false
    },
    {
      id: "CL-017",
      title: "Notiz in Jonahs Wohnung",
      locationId: "LOC-005",
      text: "Nicht Mara anrufen, bevor die Zeit stimmt.",
      revealsFlags: ["clue_note_noMaraBeforeTime_found"],
      supportsHypotheses: ["HYP-002", "HYP-004"],
      mandatory: false
    }
  ],
  scenes: [
    {
      id: "SCENE-001",
      title: "Briefing: Der Fall wird geoeffnet",
      locationId: "LOC-001",
      cinematicIntro: [
        "Der Raum ist kalt. Zu kalt fuer ein normales Briefing.",
        "Director Reiter legt vier Akten auf den Tisch.",
        "Ein Mann ist verschwunden. Die Nacht hat mehr verloren als eine Person."
      ],
      objective: "Den Fall oeffnen und die erste Scheinrealitaet etablieren.",
      unlocksClues: ["CL-001", "CL-002", "CL-003", "CL-004"],
      setsFlags: ["caseOpened", "briefingAccepted"],
      choices: [
        {
          id: "SC1-CHOICE-1",
          prompt: "Auftrag klaeren",
          response: [
            "Rekonstruktion, nicht Spekulation.",
            "Finde zuerst die Form der Luege."
          ],
          setsFlags: []
        },
        {
          id: "SC1-CHOICE-2",
          prompt: "Jonah-Profil vertiefen",
          response: [
            "Unauffaellig genug, um uebersehen zu werden.",
            "Wichtig genug, um nicht frei zu bleiben."
          ],
          setsFlags: []
        },
        {
          id: "SC1-CHOICE-3",
          prompt: "Codewort weisse Stunde einordnen",
          response: [
            "Vermutlich ein Zeitfenster.",
            "Wenn es ein Wort gibt, gab es vorher schon ein Verfahren."
          ],
          setsFlags: ["hypothesis_kidnapping_forming"]
        }
      ]
    },
    {
      id: "SCENE-002",
      title: "Parkhaus Nord",
      locationId: "LOC-002",
      cinematicIntro: [
        "Neonlicht zerschneidet Beton.",
        "Das Parkhaus wirkt nicht leer, sondern ausradiert."
      ],
      objective: "Die scheinbare Entfuehrung am Ort der Inszenierung zerlegen.",
      unlocksClues: ["CL-005", "CL-006", "CL-007", "CL-008"],
      setsFlags: [],
      choices: [
        {
          id: "SC2-CHOICE-1",
          prompt: "Emil Brandt befragen",
          response: [
            "Es gab einen weissen Flackermoment.",
            "Ein Lieferwagen war da, aber die Aussage ist unsicher."
          ],
          setsFlags: ["rel_emil_parkhaus", "rel_emil_whiteflash"]
        },
        {
          id: "SC2-CHOICE-2",
          prompt: "Kamerabilder priorisieren",
          response: [
            "Das Bild ist sauber, aber zeitlich fragil.",
            "Die Schatten sprechen gegen den Timestamp."
          ],
          setsFlags: ["hypothesis_timeManipulation_forming"]
        },
        {
          id: "SC2-CHOICE-3",
          prompt: "Lieferwagen als Hauptspur setzen",
          response: [
            "Spur ist sichtbar genug, um verlockend zu sein.",
            "Moeglicherweise absichtliche Ueberdeutlichkeit."
          ],
          setsFlags: ["fail_redHerringFollowed"]
        }
      ]
    },
    {
      id: "SCENE-003",
      title: "Tankstelle B7",
      locationId: "LOC-003",
      cinematicIntro: [
        "Ein greller Korridor aus Licht, Kaffee und Muedigkeit.",
        "Hier beginnt die Zeitleiste zu brechen."
      ],
      objective: "Nachweisen, dass Jonah auf ein Zeitfenster wartete.",
      unlocksClues: ["CL-009", "CL-010", "CL-011"],
      setsFlags: [],
      choices: [
        {
          id: "SC3-CHOICE-1",
          prompt: "Kassiererin befragen",
          response: [
            "Jonah war angespannt, aber vorbereitet.",
            "Nicht panisch, sondern auf Timing fokussiert."
          ],
          setsFlags: ["clue_cashier_statement_taken"]
        },
        {
          id: "SC3-CHOICE-2",
          prompt: "Beleg mit Parkhauszeit abgleichen",
          response: [
            "Tankstellenzeit widerspricht Entfuehrungsthese.",
            "Zeitmanipulation wird zur harten Option."
          ],
          setsFlags: ["hypothesis_timeManipulation_forming"]
        },
        {
          id: "SC3-CHOICE-3",
          prompt: "Notiz zur weissen Stunde analysieren",
          response: [
            "Das Wort wirkt wie ein festes Einsatzfenster.",
            "Nicht zufaellig, sondern operational."
          ],
          setsFlags: ["hypothesis_transfer_forming"]
        },
        {
          id: "SC3-CHOICE-4",
          prompt: "Zeitspur ignorieren und Entfuehrung halten",
          response: [
            "Das Modell bleibt scheinbar einfach, verliert aber Erklaerungskraft.",
            "Die Uhr wird zur unbeantworteten Wunde im Fall."
          ],
          setsFlags: ["fail_timeIgnored"]
        }
      ]
    },
    {
      id: "SCENE-004",
      title: "Verwaltungsarchiv",
      locationId: "LOC-004",
      cinematicIntro: [
        "Keine Fenster. Nur Zugriffe.",
        "Hier werden Wahrheiten nicht geloescht, sondern verschoben."
      ],
      objective: "Technische Manipulation und internen Zugriff belegen.",
      unlocksClues: ["CL-012", "CL-013", "CL-014"],
      setsFlags: ["hypothesis_internalAccess_forming"],
      choices: [
        {
          id: "SC4-CHOICE-1",
          prompt: "Wartungsfenster pruefen",
          response: [
            "23:44 bis 00:04. Genau im kritischen Intervall.",
            "Das ist keine Panne, das ist Infrastruktur."
          ],
          setsFlags: ["truth_internalAccess_confirmed", "truth_timeManipulated_confirmed"]
        },
        {
          id: "SC4-CHOICE-2",
          prompt: "Noura identifizieren",
          response: [
            "Sie hatte Zugriff auf Synchronisationsmodule.",
            "Kein finaler Schuldbeweis, aber technische Moeglichkeit."
          ],
          setsFlags: []
        },
        {
          id: "SC4-CHOICE-3",
          prompt: "Ralf mit Freigaben konfrontieren",
          response: [
            "Formal korrekt freigegeben.",
            "Inhaltlich hochgradig verdachtig."
          ],
          setsFlags: ["rel_ralf_access", "rel_ralf_approval"]
        }
      ]
    },
    {
      id: "SCENE-005",
      title: "Wohnung Jonah Hale",
      locationId: "LOC-005",
      cinematicIntro: [
        "Zu sauber, um privat zu sein.",
        "Nichts deutet auf Flucht, alles auf Absicht."
      ],
      objective: "Persoenliche Spur sichern und Uebergabethese staerken.",
      unlocksClues: ["CL-015", "CL-016", "CL-017"],
      setsFlags: [],
      choices: [
        {
          id: "SC5-CHOICE-1",
          prompt: "Audiofragment auswerten",
          response: [
            "Nicht direkt am Parkhaus. Weisse Stunde zuerst.",
            "Danach nur noch Timing."
          ],
          setsFlags: ["hypothesis_transfer_forming"]
        },
        {
          id: "SC5-CHOICE-2",
          prompt: "Notiz zu Mara lesen",
          response: [
            "Mara ist nicht Warnung, sondern Teil einer Choreografie."
          ],
          setsFlags: ["rel_jonah_mara", "rel_mara_transfer", "hypothesis_maraComplicit_forming"]
        },
        {
          id: "SC5-CHOICE-3",
          prompt: "Fingerabdruck priorisieren",
          response: [
            "Naehe bestaetigt, Schuld bleibt offen."
          ],
          setsFlags: []
        }
      ]
    },
    {
      id: "SCENE-006",
      title: "Gespraech mit Mara Voss",
      locationId: "LOC-005",
      requiredFlags: [
        "clue_mara_lastContact_seen",
        "clue_whiteHour_note_found",
        "clue_tankReceipt_found",
        "clue_syncOffset_found"
      ],
      cinematicIntro: [
        "Mara tritt ins Licht, als haette sie die Szene schon erlebt.",
        "Sie beantwortet Fragen so, dass jede Antwort eine zweite Tuer oeffnet."
      ],
      objective: "Mara als Scharnierfigur einordnen: beteiligt, aber nicht zwingend Haupttaeterin.",
      unlocksClues: [],
      setsFlags: [],
      choices: [
        {
          id: "SC6-CHOICE-1",
          prompt: "Was ist die weisse Stunde?",
          response: [
            "Ein Zeitfenster, nicht fuer Moral, sondern fuer Unsichtbarkeit.",
            "Kein Fehler im System. Ein unsichtbarer Teil davon."
          ],
          setsFlags: ["truth_transfer_confirmed"]
        },
        {
          id: "SC6-CHOICE-2",
          prompt: "Wurde Jonah entfuehrt?",
          response: [
            "Nein. Er wurde bewegt, nicht geraubt."
          ],
          setsFlags: ["truth_transfer_confirmed"]
        },
        {
          id: "SC6-CHOICE-3",
          prompt: "Sind Sie beteiligt?",
          response: [
            "Ja. Die Frage ist nicht nur Schuld, sondern Zweck."
          ],
          setsFlags: ["hypothesis_maraComplicit_forming", "truth_mara_involved"]
        },
        {
          id: "SC6-CHOICE-4",
          prompt: "Mara sofort als Hauptschuldige festlegen",
          response: [
            "Die moralische Grauzone wird abgeschnitten.",
            "Der Fall wird scheinbar klarer, aber enger und fragiler."
          ],
          setsFlags: ["fail_maraPrematurelyCondemned"]
        }
      ]
    },
    {
      id: "SCENE-007",
      title: "Abschlussanalyse / Beweiswand",
      locationId: "LOC-001",
      requiredFlags: [
        "clue_syncOffset_found",
        "clue_tankReceipt_found",
        "truth_transfer_confirmed",
        "clue_wartungslog_found"
      ],
      cinematicIntro: [
        "Die Beweiswand ist keine Wand mehr, sondern eine Maschine aus Entscheidungen.",
        "Die letzte Verbindung entscheidet, welche Wahrheit offiziell ueberlebt."
      ],
      objective: "Hauptthese festlegen und Fallabschluss ausloesen.",
      unlocksClues: [],
      setsFlags: [],
      choices: [
        {
          id: "SC7-CHOICE-1",
          prompt: "Externe Entfuehrung als Hauptthese",
          response: [
            "Die Rekonstruktion bricht an Zeit, Zugriff und Ablauflogik."
          ],
          setsFlags: ["fail_wrongMainSuspect", "fail_redHerringFollowed"]
        },
        {
          id: "SC7-CHOICE-2",
          prompt: "Kontrollierte Uebergabe als Hauptthese",
          response: [
            "Die Spur haelt zusammen: Jonah wurde verschoben, nicht geraubt."
          ],
          setsFlags: ["truth_transfer_confirmed"]
        },
        {
          id: "SC7-CHOICE-3",
          prompt: "Interner Zugriff als Ermoeglicher",
          response: [
            "Wartungsfenster und Missbrauch wurden aktiv zusammengefuehrt."
          ],
          setsFlags: ["truth_internalAccess_confirmed"]
        },
        {
          id: "SC7-CHOICE-4",
          prompt: "Lieferwagen als rote Faehrte verwerfen",
          response: [
            "Zu sichtbar, um Kernspur zu sein."
          ],
          setsFlags: ["truth_van_redHerring"]
        }
      ]
    }
  ],
  endings: [
    {
      id: "END_A",
      title: "Vollstaendig geloest",
      conditions: {
        allOf: [
          "truth_transfer_confirmed",
          "truth_timeManipulated_confirmed",
          "truth_internalAccess_confirmed"
        ],
        noneOf: ["fail_wrongMainSuspect", "fail_maraPrematurelyCondemned"]
      },
      rewardFlags: ["staffel_cutpoint_hint"],
      postText: "Der Schnitt im Symbol ist kein Zeichen. Er ist ein Schnittpunkt."
    },
    {
      id: "END_B",
      title: "Teilweise geloest",
      conditions: {
        allOf: ["truth_transfer_confirmed", "truth_timeManipulated_confirmed"],
        noneOf: ["truth_internalAccess_confirmed", "fail_wrongMainSuspect"]
      },
      postText: "Ein Teil der Wahrheit ist sichtbar. Der Rest bleibt hinter Verwaltungsgrenzen."
    },
    {
      id: "END_C",
      title: "Ungeklaert",
      conditions: {
        anyOf: ["fail_wrongMainSuspect", "fail_timeIgnored", "fail_redHerringFollowed"]
      },
      postText: "Der Fall bleibt offiziell offen. Die echte Struktur wurde nicht erkannt."
    },
    {
      id: "END_D",
      title: "Falsch geschlossen",
      conditions: {
        allOf: ["hypothesis_maraComplicit_forming", "fail_maraPrematurelyCondemned"],
        noneOf: ["truth_internalAccess_confirmed"]
      },
      postText: "Ein zu frueher Schuldschluss verschliesst die eigentliche Tuer."
    }
  ],
  failStates: [
    {
      id: "FAIL-01",
      title: "Falscher Hauptverdaechtiger",
      triggerFlags: ["fail_wrongMainSuspect"]
    },
    {
      id: "FAIL-02",
      title: "Zeit ignoriert",
      triggerFlags: ["fail_timeIgnored"]
    },
    {
      id: "FAIL-03",
      title: "Rote Faehrte dominiert",
      triggerFlags: ["fail_redHerringFollowed"]
    },
    {
      id: "FAIL-04",
      title: "Mara vorschnell verurteilt",
      triggerFlags: ["fail_maraPrematurelyCondemned"]
    }
  ],
  synopsis: [
    "Ein Informant verschwindet nach einer naechtlichen Uebergabe.",
    "Tankstelle und Parkhaus widersprechen sich in der Zeit.",
    "Ein Wartungsfenster oeffnet die Tuer ins Innere des Systems.",
    "Der Fall endet nicht in einer Entfuehrung, sondern in einer kontrollierten Uebergabe."
  ]
};
