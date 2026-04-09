/**
 * FALL 1: "Die weiße Stunde"
 * Ein hochrangiger Informant verschwindet nach einer routinemäßigen Übergabe.
 */

const FALL_1 = {
  id: 'fall_1_weisse_stunde',
  title: 'Die weiße Stunde',
  subtitle: 'Fall 01 — Staffel I',
  timeLimitMs: null, // kein harter Timer für Fall 1 (Tutorial)
  briefing: `
    <p>Donnerstag, 03:17 Uhr. Agent <strong>Viktor Szabo</strong>, Deckname WEISS, kehrt nicht aus einer routinemäßigen Übergabe zurück. Szabo war seit vier Jahren aktiv und lieferte zuverlässige Informationen über ein osteuropäisches Handelsnetzwerk.</p>
    <p>Letzte bekannte Position: <strong>Hotel Meridian, Zimmer 412</strong>. Übergabepunkt: Parkhaus Ebene -2.</p>
    <p>Es gibt keine Leiche. Kein Signal. Kein Kontakt.</p>
    <p>Ihr Auftrag: Rekonstruieren Sie, was in dieser Nacht geschehen ist.</p>
  `,

  // ─── START-FLAGS (sofort bekannt) ─────────────────────────────────────────
  startFlags: [
    { id: 'informant_name',    value: 'Viktor Szabo',    priority: 4, source: 'BRIEFING', locked: true },
    { id: 'codename',          value: 'WEISS',           priority: 4, source: 'BRIEFING', locked: true },
    { id: 'last_location',     value: 'Hotel Meridian',  priority: 3, source: 'BRIEFING' },
    { id: 'meeting_type',      value: 'routine',         priority: 2, source: 'BRIEFING' },
  ],

  // ─── START-NODES (sofort sichtbar) ────────────────────────────────────────
  startNodes: ['szabo', 'hotel_meridian', 'briefing_doc'],

  // ─── ALLE NODES ───────────────────────────────────────────────────────────
  nodes: [
    // ── PERSONEN ──────────────────────────────────────────────────────────
    {
      id: 'szabo',
      type: 'person',
      label: 'Viktor Szabo',
      description: 'Informant, Deckname WEISS. Aktiv seit 4 Jahren. Spezialisiert auf osteuropäische Logistiknetzwerke. Bekannt für akkurate Berichte — zuletzt jedoch 3 Wochen schweigen.',
      trustLevel: 'B',
      flagsOnReveal: [
        { id: 'szabo_active',      value: true,         priority: 3, source: 'FILE' },
        { id: 'szabo_last_report', value: '3_weeks_ago',priority: 3, source: 'FILE' },
      ],
      connections: [
        { targetId: 'hotel_meridian',   linkType: 'saw',         note: 'Letzter bekannter Aufenthaltsort' },
        { targetId: 'handler_muller',   linkType: 'confirmed',   note: 'Primärer Handler', flagOnConnect: { id: 'handler_known', value: true, priority: 3, source: 'PLAYER_DEDUCTION' } },
        { targetId: 'szabo_own_report', linkType: 'suggests',    note: 'Enthielt zurückgehaltene Daten' },
        { targetId: 'unknown_contact',  linkType: 'motivated',   note: 'Traf unbekannte Person am Vorabend' },
      ],
    },
    {
      id: 'handler_muller',
      type: 'person',
      label: 'Hauptmann Klaus Müller',
      description: 'Szabos Handler. Seit 8 Jahren in der Abteilung. Bestätigte den Übergabeauftrag um 22:30 Uhr. Behauptet, er habe danach keinen Kontakt mehr gehabt.',
      trustLevel: 'C',
      flagsOnReveal: [
        { id: 'muller_cleared_szabo', value: true, priority: 2, source: 'MULLER_STATEMENT' },
      ],
      connections: [
        { targetId: 'szabo',          linkType: 'confirmed', note: 'Handler/Informant-Beziehung' },
        { targetId: 'muller_phone',   linkType: 'enables',   note: 'Telefonat um 02:47 Uhr — unerklärt', flagOnConnect: { id: 'muller_phone_anomaly', value: true, priority: 4, source: 'PLAYER_DEDUCTION' } },
        { targetId: 'parking_garage', linkType: 'saw',       note: 'War laut eigener Aussage nie dort' },
      ],
    },
    {
      id: 'unknown_contact',
      type: 'person',
      label: 'Unbekannte Kontaktperson',
      description: 'Hotelkamera erfasste eine Person in Szabos Zimmerflur um 21:15 Uhr. Gesicht nicht erkennbar. Bewegungsprofil: professionell, kontrolliert.',
      trustLevel: 'C',
      flagsOnReveal: [
        { id: 'contact_present', value: true, priority: 3, source: 'CCTV_HOTEL' },
      ],
      connections: [
        { targetId: 'hotel_room_412',  linkType: 'saw',       note: 'Vor Szabos Zimmer gesichtet' },
        { targetId: 'szabo',           linkType: 'motivated',  note: 'Mögliche Instruktion oder Drohung' },
        { targetId: 'envelope_found',  linkType: 'enables',   note: 'Ließ Umschlag im Flur zurück' },
      ],
    },
    {
      id: 'witness_reception',
      type: 'person',
      label: 'Rezeptionist Tomáš Horak',
      description: 'Nachtschicht, 23:00–06:00. Sah Szabo gegen 01:30 Uhr die Lobby passieren. Sagt, Szabo habe "seltsam schnell" ausgesehen. Nervös bei Befragung.',
      trustLevel: 'D',
      flagsOnReveal: [
        { id: 'szabo_lobby_01h30', value: true, priority: 2, source: 'WITNESS_HORAK' },
      ],
      connections: [
        { targetId: 'hotel_meridian',  linkType: 'saw', note: 'Stammt von dort, kennt das Hotel gut' },
        { targetId: 'cctv_lobby',      linkType: 'contradicts', note: 'Kamera zeigt Lobby um 01:30 Uhr — leer', flagOnConnect: { id: 'horak_statement_suspicious', value: true, priority: 4, source: 'PLAYER_DEDUCTION' } },
      ],
    },
    {
      id: 'real_handler',
      type: 'person',
      label: 'Agent Irina Westermann',
      description: 'GEHEIMAKTE — Freigeschaltet in Phase 3. Westermann war Szabos eigentliche Backup-Kontaktperson, inoffiziell. Müller wusste davon nicht. Sie initiierte die Übergabe selbstständig.',
      trustLevel: 'A',
      locked: true,
      flagsOnReveal: [
        { id: 'westermann_exists',    value: true,          priority: 5, source: 'CLASSIFIED_FILE', locked: true },
        { id: 'real_initiator',       value: 'Westermann',  priority: 5, source: 'CLASSIFIED_FILE', locked: true },
        { id: 'muller_was_deceived',  value: true,          priority: 4, source: 'CLASSIFIED_FILE' },
      ],
      connections: [
        { targetId: 'parking_garage', linkType: 'enables',  note: 'War im Parkhaus — Zeuge C', flagOnConnect: { id: 'westermann_at_garage', value: true, priority: 4, source: 'PLAYER_DEDUCTION' } },
        { targetId: 'szabo',          linkType: 'motivated', note: 'Szabo vertraute ihr mehr als Müller' },
        { targetId: 'szabo_data',     linkType: 'enables',  note: 'Die Daten — für sie bestimmt', flagOnConnect: { id: 'data_destination_known', value: true, priority: 5, source: 'PLAYER_DEDUCTION' } },
      ],
    },

    // ── ORTE ─────────────────────────────────────────────────────────────
    {
      id: 'hotel_meridian',
      type: 'location',
      label: 'Hotel Meridian',
      description: 'Vier-Sterne-Hotel. Szabo buchte unter Alias "Karl Bauer". Check-in 19:45. Checkout: nie erfolgt. Zimmer 412 im 4. Stock, Trakt C.',
      trustLevel: 'A',
      flagsOnReveal: [
        { id: 'hotel_alias', value: 'Karl Bauer', priority: 3, source: 'HOTEL_RECORDS' },
      ],
      connections: [
        { targetId: 'hotel_room_412',  linkType: 'confirmed', note: 'Buchungsdatensatz' },
        { targetId: 'cctv_lobby',      linkType: 'enables',   note: 'CCTV-System vorhanden' },
        { targetId: 'witness_reception', linkType: 'saw',     note: 'Rezeptionist Horak war anwesend' },
      ],
    },
    {
      id: 'hotel_room_412',
      type: 'location',
      label: 'Zimmer 412',
      description: 'Das Zimmer zeigt Spuren eines schnellen Aufbruchs. Koffer zurückgelassen. Bettwäsche benutzt. Auf dem Nachttisch: ein Glas mit Fingerabdrücken — nicht Szabos.',
      trustLevel: 'A',
      flagsOnReveal: [
        { id: 'quick_departure', value: true, priority: 4, source: 'FORENSICS' },
        { id: 'foreign_prints',  value: true, priority: 4, source: 'FORENSICS' },
        { id: 'luggage_left',    value: true, priority: 3, source: 'FORENSICS' },
      ],
      connections: [
        { targetId: 'unknown_contact',  linkType: 'saw',       note: 'Fremde Fingerabdrücke' },
        { targetId: 'envelope_found',   linkType: 'confirmed', note: 'Umschlag unter dem Bett' },
        { targetId: 'szabo',            linkType: 'confirmed', note: 'Selbstverständlich sein Zimmer' },
      ],
    },
    {
      id: 'parking_garage',
      type: 'location',
      label: 'Parkhaus — Ebene -2',
      description: 'Übergabepunkt laut Instruktionsprotokoll. Kamera auf Ebene -2 war um 01:15 Uhr ausgefallen — 14 Minuten offline. Danach: keine Fahrzeuge registriert, aber Reifenspuren auf frischem Öl.',
      trustLevel: 'B',
      flagsOnReveal: [
        { id: 'camera_offline', value: true, priority: 4, source: 'SECURITY_LOG' },
        { id: 'tire_tracks',    value: true, priority: 3, source: 'FORENSICS' },
      ],
      connections: [
        { targetId: 'szabo',         linkType: 'saw',       note: 'Übergabepunkt, aber: war er da?' },
        { targetId: 'muller_phone',  linkType: 'contradicts', note: 'Müller sagt er war nie hier — Reifenmuster passt zu seinem Dienstwagen', flagOnConnect: { id: 'muller_at_garage', value: true, priority: 4, source: 'PLAYER_DEDUCTION' } },
        { targetId: 'real_handler',  linkType: 'enables',   note: 'Freigeschaltet durch anderes Indiz' },
      ],
    },
    {
      id: 'szabo_safe_house',
      type: 'location',
      label: 'Safehouse Kaiserstraße 17',
      description: 'Szabo kannte dieses Versteck — es stand nicht in seinen offiziellen Akten. Entdeckt durch Quervergleich alter Spesenabrechnungen. Licht war in dieser Nacht an.',
      trustLevel: 'B',
      locked: true,
      flagsOnReveal: [
        { id: 'safehouse_used', value: true, priority: 3, source: 'EXPENSE_RECORDS' },
      ],
      connections: [
        { targetId: 'szabo',         linkType: 'confirmed', note: 'Sein informelles Versteck' },
        { targetId: 'real_handler',  linkType: 'motivated', note: 'Westermann wusste davon' },
        { targetId: 'szabo_data',    linkType: 'enables',   note: 'Dort befand sich der Datensatz' },
      ],
    },

    // ── OBJEKTE ──────────────────────────────────────────────────────────
    {
      id: 'envelope_found',
      type: 'object',
      label: 'Umschlag — ohne Absender',
      description: 'Unter dem Bett in Zimmer 412 gefunden. Enthält eine handgeschriebene Koordinate und die Uhrzeit "02:00". Keine Fingerabdrücke außen. Papier: Standard, in drei Ländern erhältlich.',
      trustLevel: 'B',
      flagsOnReveal: [
        { id: 'envelope_coords', value: '48.1351N_11.5820E', priority: 3, source: 'FORENSICS' },
        { id: 'envelope_time',   value: '02:00',              priority: 3, source: 'FORENSICS' },
      ],
      connections: [
        { targetId: 'parking_garage', linkType: 'confirms', note: 'Koordinate entspricht Parkhaus-Einfahrt' },
        { targetId: 'unknown_contact', linkType: 'enabled', note: 'Wurde von unbekannter Person hinterlassen' },
      ],
    },
    {
      id: 'muller_phone',
      type: 'object',
      label: 'Telefonprotokoll — Müller',
      description: 'Abgehörtes Telefonat: Müller rief eine unregistrierte Nummer um 02:47 Uhr an. Das Gespräch dauerte 3 Minuten. Inhalt nicht aufgezeichnet, aber Standort des Empfängers: im Parkhaus.',
      trustLevel: 'A',
      flagsOnReveal: [
        { id: 'muller_called_garage', value: true,          priority: 4, source: 'PHONE_TAP' },
        { id: 'call_time',            value: '02:47',       priority: 4, source: 'PHONE_TAP' },
      ],
      connections: [
        { targetId: 'handler_muller',  linkType: 'confirms', note: 'Müllers Gerät' },
        { targetId: 'parking_garage',  linkType: 'enables',  note: 'Empfänger war im Parkhaus' },
        { targetId: 'real_handler',    linkType: 'motivated', note: 'War Westermann am Telefon?' },
      ],
    },
    {
      id: 'szabo_own_report',
      type: 'object',
      label: 'Szabos letzter Bericht',
      description: 'Drei Wochen alter Bericht. Inhalt: oberflächlich. Aber im Anhang fehlt Seite 7. Die Metadaten zeigen: Seite 7 existierte, wurde nachträglich entfernt — 48 Stunden vor seinem Verschwinden.',
      trustLevel: 'B',
      flagsOnReveal: [
        { id: 'report_page_missing', value: true,     priority: 4, source: 'METADATA_ANALYSIS' },
        { id: 'deletion_timestamp',  value: 'minus48h', priority: 3, source: 'METADATA_ANALYSIS' },
      ],
      connections: [
        { targetId: 'szabo',          linkType: 'confirms', note: 'Sein eigener Bericht' },
        { targetId: 'szabo_data',     linkType: 'suggests', note: 'Was stand auf Seite 7?' },
        { targetId: 'muller_phone',   linkType: 'motivated', note: 'Löschung — Müller hatte Zugriff' },
      ],
    },
    {
      id: 'szabo_data',
      type: 'object',
      label: 'Datensatz — Netzwerk "Osten-7"',
      description: 'GESPERRT — Phase 3. Szabo hatte Zugriff auf ein Dokument, das ein vollständiges Liefernetzwerk enthüllte. Er hat es kopiert. Der Verbleib ist unbekannt. Dieser Datensatz war der eigentliche Kern der Übergabe.',
      trustLevel: 'A',
      locked: true,
      flagsOnReveal: [
        { id: 'data_existed',       value: true,     priority: 5, source: 'CLASSIFIED', locked: true },
        { id: 'data_was_copied',    value: true,     priority: 5, source: 'CLASSIFIED', locked: true },
        { id: 'szabo_not_victim',   value: true,     priority: 4, source: 'CLASSIFIED' },
      ],
      connections: [
        { targetId: 'szabo',         linkType: 'confirmed',  note: 'Szabo besaß den Datensatz' },
        { targetId: 'real_handler',  linkType: 'motivated',  note: 'Westermann wollte ihn haben' },
        { targetId: 'szabo_safe_house', linkType: 'enables', note: 'Dort verwahrt' },
      ],
    },

    // ── AUSSAGEN / EVENTS ─────────────────────────────────────────────────
    {
      id: 'cctv_lobby',
      type: 'event',
      label: 'CCTV-Aufnahme: Lobby 01:30 Uhr',
      description: 'Kameraaufnahme zeigt die Lobby um 01:28–01:35 Uhr. Kein Szabo. Aber: Ein schwarzer Mantel ist im Bild — Richtung Seitenausgang. Bildqualität: 38% Auflösung, Rauschen.',
      trustLevel: 'C',
      flagsOnReveal: [
        { id: 'szabo_not_in_lobby', value: true, priority: 3, source: 'CCTV' },
        { id: 'black_coat_seen',    value: true, priority: 2, source: 'CCTV' },
      ],
      connections: [
        { targetId: 'witness_reception', linkType: 'contradicts', note: 'Horak sah Szabo — Kamera nicht' },
        { targetId: 'unknown_contact',   linkType: 'suggests',    note: 'War das die unbekannte Person?' },
        { targetId: 'hotel_room_412',    linkType: 'enables',     note: 'Szabo könnte durch Hinterausgang' },
      ],
    },
    {
      id: 'briefing_doc',
      type: 'document',
      label: 'Übergabe-Instruktion (intern)',
      description: 'Offizielle Anweisung für Szabo. Unterzeichnet von Müller. Zeitfenster: 01:00–02:30. Übergabegegenstand nicht spezifiziert — Feld leer. Das ist protokollwidrig.',
      trustLevel: 'B',
      flagsOnReveal: [
        { id: 'transfer_object_blank', value: true, priority: 4, source: 'INTERNAL_DOC' },
        { id: 'muller_signed',         value: true, priority: 3, source: 'INTERNAL_DOC' },
      ],
      connections: [
        { targetId: 'handler_muller',  linkType: 'confirmed',   note: 'Müllers Unterschrift' },
        { targetId: 'parking_garage',  linkType: 'enables',     note: 'Übergabeort' },
        { targetId: 'szabo_own_report',linkType: 'contradicts', note: 'Bericht und Auftrag stimmen nicht überein' },
      ],
    },
  ],

  // ─── PHASE-TRANSITIONS ────────────────────────────────────────────────────
  phaseTransitions: [
    {
      fromPhase: 0,
      toPhase: 1,
      condition: { type: 'REVEALED_COUNT', min: 3 },
      unlockNodes: ['witness_reception', 'cctv_lobby'],
    },
    {
      fromPhase: 1,
      toPhase: 2,
      condition: { type: 'FLAGS_ALL', ids: ['foreign_prints', 'camera_offline'] },
      unlockNodes: ['real_handler', 'szabo_safe_house'],
    },
    {
      fromPhase: 2,
      toPhase: 3,
      condition: { type: 'FLAGS_ANY', ids: ['westermann_exists', 'muller_at_garage'] },
      unlockNodes: ['szabo_data'],
    },
  ],

  // ─── OPERATIVE ENTSCHEIDUNGEN ─────────────────────────────────────────────
  operationChoices: [
    {
      id: 'op_muller',
      phase: 2,
      label: 'Umgang mit Müller',
      description: 'Müller verhält sich auffällig. Wie gehen Sie vor?',
      options: [
        {
          id: 'observe',
          label: 'Weiter observieren',
          description: 'Müller nicht konfrontieren. Warten, ob er sich selbst belastet.',
          flags: [{ id: 'muller_observed', value: true, priority: 3, source: 'OP_CHOICE' }],
          unlockNodes: ['muller_phone'],
        },
        {
          id: 'confront',
          label: 'Direkt konfrontieren',
          description: 'Müller befragen. Risiko: er warnt Westermann, falls verbunden.',
          flags: [
            { id: 'muller_confronted', value: true, priority: 3, source: 'OP_CHOICE' },
            { id: 'westermann_warned', value: true, priority: 3, source: 'OP_CONSEQUENCE' },
          ],
          lockNodes: ['real_handler'],
        },
        {
          id: 'archive',
          label: 'Müller für später parken',
          description: 'Akte übergeben. Müller wird nicht festgehalten, aber markiert.',
          flags: [{ id: 'muller_flagged', value: true, priority: 2, source: 'OP_CHOICE' }],
        },
      ],
    },
    {
      id: 'op_safehouse',
      phase: 3,
      label: 'Safehouse-Zugriff',
      description: 'Das Safehouse zeigt Aktivität. Wie vorgehen?',
      options: [
        {
          id: 'immediate_raid',
          label: 'Sofort eingreifen',
          description: 'Team zum Safehouse. Risiko: Szabo (falls dort) flieht oder wird gefährdet.',
          flags: [{ id: 'raid_executed', value: true, priority: 4, source: 'OP_CHOICE' }],
          unlockNodes: ['szabo_data'],
        },
        {
          id: 'wait_confirm',
          label: 'Erst bestätigen',
          description: 'Warten auf Bestätigung, ob Szabo dort ist.',
          flags: [{ id: 'safehouse_verified', value: true, priority: 3, source: 'OP_CHOICE' }],
          unlockNodes: ['szabo_data', 'real_handler'],
        },
      ],
    },
  ],

  // ─── ENDINGS (Priorität absteigend) ───────────────────────────────────────
  endings: [
    {
      id: 'end_full_truth',
      label: 'Vollständige Auflösung',
      priority: 100,
      required: [
        'westermann_exists',
        'data_destination_known',
        { type: 'VALUE', id: 'real_initiator', value: 'Westermann' },
        'muller_was_deceived',
        { type: 'MIN_PRIORITY', id: 'szabo_not_victim', min: 4 },
      ],
      forbidden: ['westermann_warned'],
      narrative: `
        Szabo war kein Opfer. Er handelte eigenständig — und Westermann war der einzige Mensch, dem er vertraute. 
        Die Übergabe war keine Exfiltration, sondern ein kontrollierter Abgang. Szabo hat das Netzwerk Osten-7 
        übergeben — nicht an die Abteilung, sondern an Westermann persönlich. Müller wurde bewusst außen vor gelassen.
        Der "Vermisstenfall" war ein inszenierter Schutz.
      `,
    },
    {
      id: 'end_partial_muller',
      label: 'Teilauflösung: Müller verdächtig, Wahrheit unklar',
      priority: 70,
      required: [
        'muller_phone_anomaly',
        'camera_offline',
        'transfer_object_blank',
      ],
      forbidden: ['westermann_exists'],
      narrative: `
        Müller ist tiefer involviert als er zugab. Das Parkhaus-Telefonat, die lückenhafte Anweisung, 
        die manipulierte Kamera — alles deutet auf seine Beteiligung hin. Aber die Wahrheit über Szabo 
        bleibt im Dunkeln. Müller wurde als Hauptverdächtiger eingestuft. Die echte Geschichte 
        — Westermann, Osten-7 — wird erst im nächsten Fall sichtbar.
      `,
      partialOk: true,
    },
    {
      id: 'end_szabo_fled',
      label: 'Fehldeutung: Szabo gilt als Überläufer',
      priority: 40,
      required: [
        'szabo_not_in_lobby',
        'quick_departure',
        'report_page_missing',
      ],
      forbidden: ['westermann_exists', 'data_destination_known'],
      narrative: `
        Die Beweise wurden falsch interpretiert. Szabo wurde offiziell als Überläufer eingestuft. 
        Der Datensatz Osten-7 gilt als kompromittiert. Westermann blieb unentdeckt. 
        Müller wurde entlastet. Der Fall wird zu einem Cold Case — und belastet alle Folge-Ermittlungen.
      `,
    },
    {
      id: 'end_undecided',
      label: 'Kein Ergebnis — Cold Case',
      priority: 10,
      required: [],
      forbidden: [],
      narrative: `
        Zu viele Widersprüche, zu wenig gesicherte Verbindungen. 
        Der Fall bleibt offen. Szabo — unbekannt. Das Netzwerk Osten-7 — aktiv. 
        Die Abteilung verlor Vertrauen in den Ermittler.
      `,
    },
  ],

  // ─── URTEIL-FELDER (Spieler gibt finale These ab) ─────────────────────────
  verdictFields: {
    suspect: {
      correctValues: ['Westermann', 'Irina Westermann'],
      hint: 'Wer hat die Übergabe wirklich initiiert?',
    },
    szabo_status: {
      correctValues: ['freiwillig', 'abgang', 'kooperiert'],
      hint: 'War Szabo Opfer — oder Akteur?',
    },
    data_destination: {
      correctValues: ['Westermann', 'safehouse'],
      hint: 'Wo befanden sich die Daten Osten-7?',
    },
    muller_role: {
      correctValues: ['unwissend', 'getäuscht', 'kein_taeter'],
      hint: 'War Müller Täter oder Opfer seiner eigenen Anweisung?',
    },
  },

  verdictChecks: [
    { flagId: 'westermann_exists',   expectedValue: true,          basePoints: 30 },
    { flagId: 'real_initiator',      expectedValue: 'Westermann',  basePoints: 25 },
    { flagId: 'szabo_not_victim',    expectedValue: true,          basePoints: 20 },
    { flagId: 'muller_was_deceived', expectedValue: true,          basePoints: 15 },
    { flagId: 'data_was_copied',     expectedValue: true,          basePoints: 10 },
  ],

  // ─── AUFLÖSUNGS-TEXT pro Ending ───────────────────────────────────────────
  resolution: {
    full: `
      Viktor Szabo war seit 18 Monaten doppelt aktiv. Irina Westermann — offiziell nur "Archiv-Analystin" — 
      führte ihn inoffiziell. Das Netzwerk Osten-7 existiert und ist aktiv. Szabo übergab den vollständigen 
      Datensatz im Parkhaus, an Westermann persönlich. Klaus Müller hatte keine Ahnung. Er war nur die 
      saubere Signatur auf einem Auftrag, den jemand anderes entworfen hatte. 
      Szabo verschwand aus freiem Willen. Er ist jetzt — irgendwo — in Sicherheit.
      
      Was Sie jetzt wissen: Es gibt jemanden in Ihrer Abteilung, der eigene Netzwerke betreibt.
      Was Sie noch nicht wissen: Warum.
    `,
    miss_westermann: `
      Sie haben das Richtige fast gesehen. Müller war verdächtig — aber nur Werkzeug. 
      Westermann, die wirkliche Architektin, blieb im Schatten. Ihre Akte war nie im Standard-Archiv.
      Sie hätten die Spesenabrechnungen prüfen müssen: Kaiserstraße 17.
    `,
    wrong_szabo: `
      Szabo wurde als Überläufer eingestuft. Das war falsch. Er hat die Seiten gewechselt — 
      aber zu jemandem, dem er vertraute. Die Unterscheidung ist entscheidend.
      In Staffel 1, Fall 3 werden Sie Szabos Namen wieder begegnen.
    `,
  },
};

if (typeof module !== 'undefined') module.exports = { FALL_1 };
