// CleanHome - Reinigungsassistent & Raumdesigner mit 2D & 3D Planer
// Standalone vanilla JS mit LocalStorage und Three.js

const STORAGE_KEY = 'cleanhome_assistant_data_v3';
const PIXELS_PER_METER = 40; // 40 Pixel = 1 Meter

// Standard-Muster-Daten (speziell abgestimmt auf das Haus des Nutzers)
const SAMPLE_DATA = {
  currentFloor: 'EG',
  tasks: [
    {
      id: 't-1',
      title: 'Offener Wohn-/Essbereich saugen (ca. 50 m²)',
      floor: 'EG',
      room: 'Wohn-Ess-Bereich',
      surface: 'Laminat',
      intervalDays: 3,
      lastDone: new Date(Date.now() - 4 * 86400000).toISOString(),
      notes: 'Laminat: Nur saugen oder nebelfeucht wischen, kein Wasser stehen lassen!'
    },
    {
      id: 't-2',
      title: 'Offene Küche & Fliesen wischen',
      floor: 'EG',
      room: 'Küche',
      surface: 'Fliesen',
      intervalDays: 4,
      lastDone: new Date(Date.now() - 5 * 86400000).toISOString(),
      notes: 'Fettlösenden Allzweckreiniger verwenden'
    },
    {
      id: 't-3',
      title: 'Gäste-WC reinigen & Sanitärkeramik desinfizieren',
      floor: 'EG',
      room: 'Gäste-WC',
      surface: 'Fliesen',
      intervalDays: 4,
      lastDone: new Date(Date.now() - 4 * 86400000).toISOString(),
      notes: 'Sanitärreiniger & separate Lappen für WC und Waschtisch'
    },
    {
      id: 't-4',
      title: 'Offene Treppe über 3 Etagen saugen & Stufen abwischen',
      floor: 'Treppe',
      room: 'Treppenhaus (3 Etagen)',
      surface: 'Holz',
      intervalDays: 7,
      lastDone: new Date(Date.now() - 8 * 86400000).toISOString(),
      notes: 'Von oben (2. OG) nach unten saugen! Geländer mit nebelfeuchtem Tuch entstauben.'
    },
    {
      id: 't-5',
      title: 'Wohnzimmer-Teppichinsel absaugen',
      floor: 'EG',
      room: 'Wohnzimmer',
      surface: 'Teppich',
      intervalDays: 4,
      lastDone: new Date(Date.now() - 2 * 86400000).toISOString(),
      notes: 'Bürstenaufsatz verwenden, Ränder gründlich absaugen'
    },
    {
      id: 't-6',
      title: 'Große Panorama-Fensterfronten putzen',
      floor: 'EG',
      room: 'Wohnküche',
      surface: 'Glas',
      intervalDays: 30,
      lastDone: new Date(Date.now() - 28 * 86400000).toISOString(),
      notes: 'Fensterabzieher + Mikrofasertuch für streifenfreien Glanz'
    },
    {
      id: 't-7',
      title: 'Eingangsflur saugen und Schmutzmatte klopfen',
      floor: 'EG',
      room: 'Flur',
      surface: 'Fliesen',
      intervalDays: 5,
      lastDone: new Date(Date.now() - 1 * 86400000).toISOString(),
      notes: 'Schmutzfangmatte ausschütteln und gründlich saugen'
    },
    {
      id: 't-8',
      title: 'Obergeschosse (1. & 2. OG) saugen & lüften',
      floor: '1.OG',
      room: 'Schlaf- & Arbeitszimmer',
      surface: 'Laminat',
      intervalDays: 7,
      lastDone: new Date(Date.now() - 6 * 86400000).toISOString(),
      notes: 'Stoßlüften und Laminatböden nebelfeucht pflegen'
    }
  ],
  plants: [
    {
      id: 'p-1',
      name: 'Ficus Benjamini (Großpflanze)',
      location: 'Wohnzimmer (Lichtdurchflutet am Fenster)',
      waterInterval: 5,
      fertilizeInterval: 21,
      lastWatered: new Date(Date.now() - 6 * 86400000).toISOString(),
      lastFertilized: new Date(Date.now() - 22 * 86400000).toISOString(),
      leavesDropping: 'yes',
      notes: 'Verliert im Herbst Blätter: Regelmäßig Boden absaugen, keine Zugluft!'
    },
    {
      id: 'p-2',
      name: 'Große Monstera Deliciosa',
      location: 'Essbereich / Übergang zur Küche',
      waterInterval: 6,
      fertilizeInterval: 21,
      lastWatered: new Date(Date.now() - 3 * 86400000).toISOString(),
      lastFertilized: new Date(Date.now() - 14 * 86400000).toISOString(),
      leavesDropping: 'yes',
      notes: 'Große Blätter verstauben schnell: 1x im Monat mit feuchtem Tuch abwischen.'
    },
    {
      id: 'p-3',
      name: 'Drachenbaum (Dracaena)',
      location: 'Flur / Treppenaufgang EG',
      waterInterval: 7,
      fertilizeInterval: 28,
      lastWatered: new Date(Date.now() - 8 * 86400000).toISOString(),
      lastFertilized: new Date(Date.now() - 10 * 86400000).toISOString(),
      leavesDropping: 'no',
      notes: 'Geringer Wasserbedarf, Staunässe strikt vermeiden.'
    }
  ],
  shopping: [
    { id: 's-1', text: 'Laminat- & Parkett-Bodenreiniger (pH-neutral)', category: 'Reinigungsmittel', done: false },
    { id: 's-2', text: 'Grünpflanzendünger flüssig', category: 'Garten & Pflanzen', done: false },
    { id: 's-3', text: 'Mikrofasertücher für Fenster & Treppengeländer', category: 'Geräte & Zubehör', done: false },
    { id: 's-4', text: 'Gallseife für Teppichflecken', category: 'Reinigungsmittel', done: true }
  ],
  floors: {
    'EG': [
      // 1. ZUSAMMENHÄNGENDER 50 m² RAUM: Ess-Küche und Wohnzimmer in einem (Laminat mit Fliesen-Küchenzone)
      { id: 'r-1', type: 'room', name: 'Wohnzimmer, Essbereich & offene Küche (ca. 50 m²)', surface: 'laminat', x: 280, y: 70, width: 660, height: 480, areaM2: 49.5 },
      
      // Fliesenbereich in der offenen Küche (optisch abgegrenzt)
      { id: 'f-kuechenfliesen', type: 'furniture', subType: 'fliesen_zone', label: 'Küchenfliesen-Zone', x: 700, y: 80, width: 230, height: 460 },
      
      // 2. EINGANGSFLUR mit Fliesen (abtrennbar mit Wand)
      { id: 'r-3', type: 'room', name: 'Flur / Diele', surface: 'fliesen', x: 60, y: 70, width: 220, height: 280, areaM2: 9.6 },
      
      // 3. GÄSTE-TOILETTE mit Fliesen
      { id: 'r-4', type: 'room', name: 'Gäste-WC', surface: 'fliesen', x: 60, y: 350, width: 220, height: 200, areaM2: 6.9 },

      // MASSIVE WÄNDE (Trennwand zwischen Flur/WC und dem 50m² Wohnraum)
      { id: 'w-trenn-1', type: 'wall', x: 275, y: 70, width: 14, height: 480, label: 'Massive Flur-Trennwand' },
      { id: 'w-trenn-2', type: 'wall', x: 60, y: 345, width: 220, height: 14, label: 'WC-Trennwand' },

      // OFFENE TREPPE über 3 Etagen (im Flur/Treppenhaus, führt ins 1. OG)
      { id: 'f-treppe', type: 'furniture', subType: 'treppe_auf', targetFloor: '1.OG', label: 'Offene Treppe (⬆ führt ins 1. OG)', x: 75, y: 85, width: 190, height: 95 },

      // TÜREN
      { id: 'd-wc', type: 'furniture', subType: 'tuer', label: 'Gäste-WC Tür', x: 195, y: 342, width: 60, height: 20 },
      { id: 'd-wohn', type: 'furniture', subType: 'tuer', label: 'Tür zum Wohnbereich', x: 272, y: 220, width: 20, height: 80 },

      // TEPPICHINSEL IM WOHNBEREICH
      { id: 'f-teppich', type: 'furniture', subType: 'teppich_insel', label: 'Wohnbereich Teppich', x: 330, y: 150, width: 240, height: 180 },

      // SCHÖNE MÖBEL: Couch, Tische, Küche
      { id: 'f-couch', type: 'furniture', subType: 'couch_eck', label: 'Designer L-Eckcouch', x: 340, y: 160, width: 220, height: 150 },
      { id: 'f-couchtisch', type: 'furniture', subType: 'couchtisch', label: 'Couchtisch Holz', x: 430, y: 235, width: 85, height: 50 },
      { id: 'f-tv', type: 'furniture', subType: 'tv_board', label: 'TV Sideboard', x: 330, y: 95, width: 160, height: 35 },
      
      { id: 'f-esstisch', type: 'furniture', subType: 'tisch_gross', label: 'Esstisch mit 6 Stühlen', x: 360, y: 390, width: 200, height: 110 },
      { id: 'f-insel', type: 'furniture', subType: 'kuecheninsel', label: 'Kücheninsel mit Herd', x: 730, y: 160, width: 180, height: 110 },
      { id: 'f-zeile', type: 'furniture', subType: 'kuechenzeile', label: 'Küchenzeile & Schränke', x: 720, y: 370, width: 200, height: 80 },

      // SANITÄROBJEKTE GÄSTE-WC
      { id: 'f-wc', type: 'furniture', subType: 'wc_haenge', label: 'Gäste-WC Hänge-WC', x: 75, y: 460, width: 60, height: 65 },
      { id: 'f-wasch', type: 'furniture', subType: 'waschtisch', label: 'Waschtisch modern', x: 170, y: 460, width: 85, height: 50 },

      // FENSTER & PANORAMAFRONTEN
      { id: 'w-1', type: 'furniture', subType: 'fenster_gross', label: 'Panoramafenster Süd (2,5 m)', x: 400, y: 60, width: 240, height: 20 },
      { id: 'w-2', type: 'furniture', subType: 'fenster_gross', label: 'Panoramafenster Garten (2,5 m)', x: 400, y: 540, width: 240, height: 20 },
      { id: 'w-3', type: 'furniture', subType: 'fenster', label: 'Küchenfenster (1,2 m)', x: 760, y: 60, width: 120, height: 20 },
      { id: 'w-4', type: 'furniture', subType: 'fenster', label: 'Gäste-WC Fenster', x: 60, y: 540, width: 90, height: 20 },

      // GROSSPFLANZEN (mit Laubabwurf)
      { id: 'p-monstera', type: 'plant', subType: 'pflanze_gross', name: 'Große Monstera', x: 620, y: 460, radius: 26 },
      { id: 'p-ficus', type: 'plant', subType: 'pflanze_ficus', name: 'Ficus Benjamini (Großbaum)', x: 620, y: 130, radius: 26 }
    ],
    '1.OG': [
      { id: 'r-10', type: 'room', name: 'Flur 1. OG', surface: 'laminat', x: 60, y: 70, width: 220, height: 480, areaM2: 16.5 },
      { id: 'r-11', type: 'room', name: 'Hauptschlafzimmer', surface: 'laminat', x: 280, y: 70, width: 360, height: 480, areaM2: 27.0 },
      { id: 'r-12', type: 'room', name: 'Großes Familienbad', surface: 'fliesen', x: 640, y: 70, width: 300, height: 480, areaM2: 22.5 },

      // Wände im 1. OG
      { id: 'w-og1-1', type: 'wall', x: 275, y: 70, width: 14, height: 480, label: 'Flurwand 1. OG' },
      { id: 'w-og1-2', type: 'wall', x: 635, y: 70, width: 14, height: 480, label: 'Badezimmerwand' },

      // Treppe: Führt abwärts ins EG und aufwärts ins 2. OG
      { id: 'f-10a', type: 'furniture', subType: 'treppe_ab', targetFloor: 'EG', label: 'Treppe abwärts (⬇ ins EG)', x: 75, y: 85, width: 190, height: 95 },
      { id: 'f-10b', type: 'furniture', subType: 'treppe_auf', targetFloor: '2.OG', label: 'Treppe aufwärts (⬆ ins 2. OG / DG)', x: 75, y: 220, width: 190, height: 95 },

      // Sanitärobjekte Bad
      { id: 'f-12', type: 'furniture', subType: 'dusche', label: 'Walk-in Glasdusche', x: 670, y: 90, width: 95, height: 95 },
      { id: 'f-13', type: 'furniture', subType: 'waschtisch', label: 'Doppelwaschtisch', x: 800, y: 90, width: 120, height: 50 },
      { id: 'w-10', type: 'furniture', subType: 'fenster_gross', label: 'Schlafzimmerfenster', x: 350, y: 60, width: 200, height: 20 }
    ],
    '2.OG': [
      { id: 'r-20', type: 'room', name: 'Dachgeschoss / Galerie (ca. 50 m²)', surface: 'laminat', x: 60, y: 70, width: 880, height: 480, areaM2: 66.0 },
      
      // Treppe: Führt abwärts ins 1. OG
      { id: 'f-20', type: 'furniture', subType: 'treppe_ab', targetFloor: '1.OG', label: 'Treppenkopf (⬇ ins 1. OG)', x: 75, y: 85, width: 190, height: 95 },
      { id: 'w-20', type: 'furniture', subType: 'fenster_gross', label: 'Dach-Panoramafenster', x: 380, y: 60, width: 260, height: 20 },
      { id: 'p-20', type: 'plant', subType: 'pflanze_gross', name: 'Große Galerie-Palme', x: 840, y: 130, radius: 26 }
    ]
  }
};

// Flecken-Ratgeber Datenbank
const STAINS_DATABASE = [
  {
    id: 'rotwein',
    title: 'Rotweinflecken',
    surfaces: ['Teppich', 'Polster', 'Laminat', 'Fliesen'],
    firstAid: 'Sofort mit Küchenpapier aufsaugen, NIEMALS reiben!',
    remedy: 'Mineralwasser (Kohlensäure), Salz oder Weißwein',
    steps: [
      '1. Flüssigkeit vorsichtig mit Küchenrolle abtupfen.',
      '2. Sprudelndes Mineralwasser darüber geben und erneut tupfen.',
      '3. Bei Teppich: Mit Salz bestreuen (zieht Feuchtigkeit & Farbe ein), nach 2 Std. absaugen.',
      '4. Bei Laminat/Fliesen: Sofort nebelfeucht mit Allzweckreiniger nachwischen, damit keine Ränder entstehen.'
    ],
    warning: 'Niemals heißes Wasser verwenden – Wärme fixiert Gerbstoffe!'
  },
  {
    id: 'kaffee',
    title: 'Kaffee- & Teeflecken',
    surfaces: ['Teppich', 'Laminat', 'Fliesen', 'Polster'],
    firstAid: 'Frische Flecken sofort abtupfen.',
    remedy: 'Lauwarmes Wasser mit mildem Spülmittel oder Gallseife',
    steps: [
      '1. Frischen Fleck mit einem Papiertuch aufnehmen.',
      '2. Mit lauwarmem Wasser und 2 Tropfen Spülmittel betupfen.',
      '3. Bei Teppich: Etwas Gallseife einarbeiten, 15 Min. einwirken lassen und mit klarem Wasser austupfen.',
      '4. Bei Laminat: Sofort trockenreiben, um Aufquellen an Fugen zu vermeiden.'
    ],
    warning: 'Bei Kaffee mit Milch zügig arbeiten, da Milcheiweiß schnell säuerlich riecht.'
  },
  {
    id: 'wachs',
    title: 'Kerzenwachs',
    surfaces: ['Teppich', 'Laminat', 'Fliesen'],
    firstAid: 'Wachs vollständig aushärten lassen – nicht im flüssigen Zustand verschmieren!',
    remedy: 'Kühlakku / Eisbeutel, danach Löschpapier & Bügeleisen',
    steps: [
      '1. Kühlpack auf das Wachs legen, bis es spröde und hart ist.',
      '2. Gröbste Stücke mit stumpfem Löffel vorsichtig abheben.',
      '3. Bei Teppich: Löschpapier (oder Küchenrolle) auflegen und mit mäßig warmem Bügeleisen überbügeln (Wachs wird flüssig und saugt sich ein).',
      '4. Bei Fliesen: Wachs abkratzen, Rückstände mit heißem Wasser & Spülmittel entfetten.'
    ],
    warning: 'Auf Laminat Bügeleisen nur extrem vorsichtig auf niedrigster Stufe anwenden, um die Beschichtung nicht zu verbrennen.'
  },
  {
    id: 'fett',
    title: 'Fett- & Ölflecken',
    surfaces: ['Fliesen', 'Laminat', 'Teppich'],
    firstAid: 'Mit Mehl, Backpulver oder Speisestärke bestreuen, um Fett aufzusaugen.',
    remedy: 'Fettlösender Küchenreiniger, Gallseife oder Spülmittel',
    steps: [
      '1. Bei frischem Fett: Stärke oder Natron aufstreuen, 20 Min. warten und absaugen.',
      '2. Bei Küchenfliesen: Fettlöser oder heißes Wasser mit Spülmittel auftragen und abwischen.',
      '3. Bei Teppich: Mit Gallseifenlösung und lauwarmem Wasser von außen nach innen vorsichtig betupfen.',
      '4. Laminat mit nebelfeuchtem Tuch und etwas Essig-Wasser nachwischen.'
    ],
    warning: 'Auf unversiegeltem Holz/Laminat niemals lösungsmittelhaltige Reiniger verwenden.'
  },
  {
    id: 'topfpflanzen',
    title: 'Pflanzenerde & Schlammränder',
    surfaces: ['Teppich', 'Laminat', 'Fliesen'],
    firstAid: 'Erde erst komplett trocknen lassen!',
    remedy: 'Staubsauger & lauwarmes Wasser',
    steps: [
      '1. Feuchte Erde niemals nass abwischen (verschmiert tief ins Gewebe).',
      '2. Trocknen lassen und den groben Schmutz gründlich absaugen.',
      '3. Bei Teppich: Rückstände mit weicher Bürste lockern und nachsaugen.',
      '4. Bei Fliesen / Laminat: Mit feuchtem Bodenwischer und Allzweckreiniger wischen.'
    ],
    warning: 'Wasserflecken unter Blumentöpfen auf Laminat sofort trocknen, da Ränder sonst dauerhaft einziehen.'
  },
  {
    id: 'kalk',
    title: 'Kalk- & Wasserflecken (Gäste-WC / Fliesen)',
    surfaces: ['Fliesen'],
    firstAid: 'Essigreiniger oder Zitronensäure einwirken lassen.',
    remedy: 'Zitronensäure, Essig, Mikrofasertuch',
    steps: [
      '1. Zitronensäurelösung auf Armaturen und Wandfliesen aufsprühen.',
      '2. 10 Minuten einwirken lassen.',
      '3. Mit Schwamm abreiben und mit klarem Wasser abspülen.',
      '4. Mit Mikrofasertuch trockenpolieren für streifenfreien Glanz.'
    ],
    warning: 'Vorsicht bei unglasierten Natursteinfliesen (Marmor): Säure greift den Stein an!'
  },
  {
    id: 'tierurin',
    title: 'Haustier- oder Urinflecken',
    surfaces: ['Teppich', 'Laminat', 'Fliesen'],
    firstAid: 'Sofort gründlich trocken tupfen.',
    remedy: 'Enzymreiniger oder Natron + Essigwasser',
    steps: [
      '1. Urin mit dicker Schicht Küchenrolle aufsaugen.',
      '2. Mit einer Mischung aus 1 Teil Essig und 2 Teilen Wasser besprühen.',
      '3. Trocknen lassen und mit Natron bestreuen (bindet Gerüche).',
      '4. Nach einigen Stunden absaugen.'
    ],
    warning: 'Niemals ammoniakhaltige Reiniger verwenden, da dies Haustiere erst recht animiert.'
  },
  {
    id: 'blut',
    title: 'Blutflecken (auf Teppich, Polster & Matratzen)',
    surfaces: ['Teppich', 'Polster', 'Laminat', 'Fliesen'],
    firstAid: 'Ausschließlich EISKALTES Wasser verwenden! Niemals warmes oder heißes Wasser!',
    remedy: 'Kaltes Salzwasser, Gallseife oder Natron-Paste',
    steps: [
      '1. Frisches Blut sofort mit eiskaltem Wasser und Küchenpapier vorsichtig von außen nach innen abtupfen.',
      '2. Eingetrocknetes Blut: Paste aus 2 EL Salz oder Natron mit kaltem Wasser anrühren und 30 Min. einwirken lassen.',
      '3. Bei Teppich/Polster: Mit einem kalten, feuchten Tuch und Gallseife sanft austupfen.',
      '4. Auf hellen Stoffen kann 3%iges Wasserstoffperoxid aufgetupft werden, um letzte Ränder restlos zu bleichen.'
    ],
    warning: 'WICHTIG: Warmes Wasser über 30°C lässt das Bluteiweiß gerinnen und bindet es dauerhaft in die Faser!'
  },
  {
    id: 'schimmel',
    title: 'Schimmel & Stockflecken (Silikon, Fugen, Wände)',
    surfaces: ['Fliesen', 'Laminat'],
    firstAid: 'Sporen nicht trocken aufwirbeln! Bei der Reinigung lüften und Handschuhe tragen.',
    remedy: '70-80% Reinigungsalkohol (Isopropanol), Wasserstoffperoxid oder Natron-Paste',
    steps: [
      '1. Fugen und Silikon im Bad mit 70% Isopropanol besprühen (tötet Schimmelpilze und Sporen zuverlässig ab).',
      '2. 20-30 Minuten einwirken lassen.',
      '3. Bei hartnäckigem Schwarzschimmel auf Fugen: Paste aus Natron und etwas Wasser auftragen und mit alter Zahnbürste scheuern.',
      '4. Mit klarem Wasser abspülen und Fugen gründlich trockenwischen.',
      '5. Vorbeugung: Nach jedem Duschen Duschwand und Fliesen mit Abzieher trocknen und 10 Min. stoßlüften.'
    ],
    warning: 'Essig NICHT auf mineralischen Putz- oder Kalkwänden anwenden – Essigsäure neutralisiert sich dort und hinterlässt Nährstoffe für noch mehr Schimmel!'
  },
  {
    id: 'rost',
    title: 'Rostflecken (auf Fliesen, Stein & Teppich)',
    surfaces: ['Fliesen', 'Teppich', 'Laminat'],
    firstAid: 'Nicht scheuern, um Kratzer auf Fliesen zu vermeiden.',
    remedy: 'Zitronensaft mit Speisesalz oder Weinstein',
    steps: [
      '1. Roststelle mit Speisesalz bedecken und frischen Zitronensaft darauf träufeln.',
      '2. Ca. 1-2 Stunden in der Sonne oder warm einwirken lassen.',
      '3. Bei Fliesen: Mit einem feuchten Tuch abwischen und gründlich nachspülen.',
      '4. Bei Teppich: Salz absaugen und Reste mit einem feuchten Tuch austupfen.'
    ],
    warning: 'Bei säureempfindlichem Naturstein (Marmor, Travertin) keine Zitrone verwenden, sondern pH-neutralen Rostumwandler.'
  },
  {
    id: 'kugelschreiber',
    title: 'Kugelschreiber & Tinte',
    surfaces: ['Laminat', 'Fliesen', 'Polster', 'Teppich'],
    firstAid: 'Nicht verwischen! Tinte sofort mit trockenem Tuch abheben.',
    remedy: 'Reinigungsalkohol / Isopropanol oder Haarspray',
    steps: [
      '1. Auf Laminat/Fliesen: Etwas Reinigungsalkohol auf ein Wattepad geben und Striche vorsichtig wegreiben.',
      '2. Auf Polster/Teppich: Haarspray aufsprühen (der Alkohol löst die Lösungsmittel der Tinte), 3 Minuten warten.',
      '3. Mit saugfähigem Küchentuch abtupfen und den Vorgang bei Bedarf wiederholen.',
      '4. Abschließend mit lauwarmem Wasser und mildem Spülmittel nachreinigen.'
    ],
    warning: 'Vorher an verdeckter Stelle prüfen, ob der Bezugsstoff farbecht ist.'
  },
  {
    id: 'kaugummi',
    title: 'Kaugummi (festgetreten im Teppich oder Polster)',
    surfaces: ['Teppich', 'Polster', 'Laminat'],
    firstAid: 'Kaugummi niemals warm versuchen abzulösen – das zieht Fäden!',
    remedy: 'Eisspray oder Eiswürfel im Plastikbeutel',
    steps: [
      '1. Eiswürfel in einen Gefrierbeutel füllen und für 10-15 Min. direkt auf den Kaugummi drücken.',
      '2. Wenn der Kaugummi glashart gefroren ist, mit der Kante eines Löffels vorsichtig zerbröckeln.',
      '3. Die gefrorenen Stücke sofort mit dem Staubsauger absaugen, bevor sie wieder weich werden.',
      '4. Eventuelle Klebereste mit ein wenig Reinigungsbenzin oder Gallseife sanft entfernen.'
    ],
    warning: 'Keine scharfen Messer verwenden, um Teppichfasern nicht abzuschneiden.'
  }
];

// App-Zustand
let appData = { ...SAMPLE_DATA };
let activeViewMode = '2d'; // '2d' | '3d'
let currentFloor = 'EG';

// ----------------------------------------------------
// STORAGE & DATA HANDLING
// ----------------------------------------------------
function initStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appData = JSON.parse(saved);
      if (!appData.floors) appData.floors = SAMPLE_DATA.floors;
      if (!appData.tasks) appData.tasks = SAMPLE_DATA.tasks;
      if (!appData.plants) appData.plants = SAMPLE_DATA.plants;
      if (!appData.shopping) appData.shopping = SAMPLE_DATA.shopping;
    } catch (e) {
      console.error('Fehler beim Laden aus LocalStorage:', e);
      appData = JSON.parse(JSON.stringify(SAMPLE_DATA));
    }
  } else {
    appData = JSON.parse(JSON.stringify(SAMPLE_DATA));
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  if (activeViewMode === '3d') {
    update3DScene();
  }
}

// ----------------------------------------------------
// UI NAVIGATION & VIEW SWITCHING
// ----------------------------------------------------
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (targetId === 'tab-floorplan') {
          if (activeViewMode === '3d') {
            initThree3D();
            update3DScene();
          } else {
            renderCanvas();
          }
        }
      }
    });
  });

  // Schwebender Nach-Oben-Scroll-Button
  const btnScrollTop = document.getElementById('btn-scroll-top');
  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', () => {
      if (window.scrollY > 160) {
        btnScrollTop.style.opacity = '1';
        btnScrollTop.style.pointerEvents = 'auto';
      } else {
        btnScrollTop.style.opacity = '0';
        btnScrollTop.style.pointerEvents = 'none';
      }
    }, { passive: true });
    btnScrollTop.style.opacity = '0';
    btnScrollTop.style.pointerEvents = 'none';
  }

  // 2D / 3D Mode Selector
  const modeBtns = document.querySelectorAll('.btn-viewmode');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeViewMode = btn.dataset.mode;

      const w2d = document.getElementById('wrapper-2d');
      const w3d = document.getElementById('wrapper-3d');
      const mode2dOnly = document.querySelectorAll('.mode-2d-only');

      if (activeViewMode === '3d') {
        w2d.style.display = 'none';
        w3d.style.display = 'flex';
        mode2dOnly.forEach(el => el.style.display = 'none');
        document.querySelectorAll('.mode-3d-only').forEach(el => el.style.display = 'inline-flex');
        initThree3D();
        update3DScene();
      } else {
        w2d.style.display = 'flex';
        w3d.style.display = 'none';
        mode2dOnly.forEach(el => el.style.display = 'flex');
        document.querySelectorAll('.mode-3d-only').forEach(el => el.style.display = 'none');
        if (currentFloor === 'ALL') {
          currentFloor = 'EG';
          document.querySelectorAll('.btn-floor').forEach(b => {
            b.classList.toggle('active', b.dataset.floor === 'EG');
          });
        }
        renderCanvas();
      }
    });
  });

  // Export / Import
  document.getElementById('btn-export-data').addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cleanhome_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  document.getElementById('btn-import-data').addEventListener('click', () => {
    document.getElementById('file-import').click();
  });

  document.getElementById('file-import').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        appData = imported;
        saveData();
        renderAll();
        alert('Daten erfolgreich wiederhergestellt!');
      } catch (err) {
        alert('Ungültiges Datenformat!');
      }
    };
    reader.readAsText(file);
  });

  // Muster-Haus laden
  document.getElementById('btn-quick-sample').addEventListener('click', () => {
    if (confirm('Möchtest du das vollständige Muster-Haus mit 3 Etagen, 50m² Wohnküche, Designer-Möbeln, Treppe und Pflanzen laden?')) {
      appData = JSON.parse(JSON.stringify(SAMPLE_DATA));
      saveData();
      renderAll();
    }
  });
}

// ----------------------------------------------------
// 1. PUTZ- & TERMINPLANER LOGIK & INTERAKTIVER KALENDER
// ----------------------------------------------------
let calCurrentDate = new Date();
let calSelectedDateStr = null;

function getDaysDifference(targetDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffTime = target - now;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function calculateNextDueDate(lastDoneDate, intervalDays) {
  const d = new Date(lastDoneDate || Date.now());
  d.setDate(d.getDate() + parseInt(intervalDays, 10));
  return d.toISOString();
}

function renderTasks() {
  const dueContainer = document.getElementById('tasks-due-list');
  const allContainer = document.getElementById('tasks-all-list');
  const filterFloor = document.getElementById('filter-floor-task').value;

  dueContainer.innerHTML = '';
  allContainer.innerHTML = '';

  let dueCount = 0;

  const filteredTasks = appData.tasks.filter(t => {
    if (filterFloor === 'all') return true;
    return t.floor === filterFloor || t.floor === 'Gesamtes Haus' || (filterFloor === 'EG' && t.floor === 'Treppe');
  });

  filteredTasks.sort((a, b) => {
    const dueA = new Date(calculateNextDueDate(a.lastDone, a.intervalDays));
    const dueB = new Date(calculateNextDueDate(b.lastDone, b.intervalDays));
    return dueA - dueB;
  });

  filteredTasks.forEach(task => {
    const nextDue = calculateNextDueDate(task.lastDone, task.intervalDays);
    const diffDays = getDaysDifference(nextDue);
    const isDue = diffDays <= 0;
    const isSoon = diffDays > 0 && diffDays <= 2;

    if (isDue) dueCount++;

    let dueText = '';
    let dueClass = '';
    if (diffDays < 0) {
      dueText = `Überfällig (${Math.abs(diffDays)} T)`;
      dueClass = 'due-overdue';
    } else if (diffDays === 0) {
      dueText = 'Heute fällig!';
      dueClass = 'due-today';
    } else if (diffDays === 1) {
      dueText = 'Morgen fällig';
      dueClass = 'due-soon';
    } else {
      dueText = `in ${diffDays} Tagen`;
      dueClass = 'due-future';
    }

    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${isDue ? 'is-due' : isSoon ? 'is-soon' : 'is-ok'}`;
    taskEl.innerHTML = `
      <div class="task-left">
        <input type="checkbox" class="task-checkbox" title="Als heute erledigt markieren" data-id="${task.id}">
        <div class="task-details">
          <span class="task-name">${task.title}</span>
          <div class="task-tags">
            <span class="tag tag-floor">📍 ${task.floor} • ${task.room || 'Allgemein'}</span>
            <span class="tag tag-surface">🧹 ${task.surface || 'Boden'}</span>
            <span class="tag">⏱️ Alle ${task.intervalDays} Tage</span>
            <span class="tag" style="background:#f1ece4; color:#645340;">📅 Fällig: ${new Date(nextDue).toLocaleDateString('de-DE')}</span>
            ${task.notes ? `<span class="tag" style="background:#f1f5f9; color:#475569;" title="${task.notes}">ℹ️ ${task.notes}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="task-status">
        <div class="due-label ${dueClass}">${dueText}</div>
        <div class="task-actions" style="margin-top: 4px; display:flex; gap:4px; justify-content: flex-end;">
          <button class="btn btn-sm btn-ghost btn-edit-task" data-id="${task.id}" title="Aufgabe bearbeiten">✏️</button>
          <button class="btn btn-sm btn-ghost btn-del-task" data-id="${task.id}" title="Löschen">🗑️</button>
        </div>
      </div>
    `;

    taskEl.querySelector('.task-checkbox').addEventListener('change', (e) => {
      if (e.target.checked) {
        task.lastDone = new Date().toISOString();
        saveData();
        renderTasks();
      }
    });

    taskEl.querySelector('.btn-edit-task').addEventListener('click', () => {
      openEditTaskModal(task);
    });

    taskEl.querySelector('.btn-del-task').addEventListener('click', () => {
      if (confirm(`Aufgabe "${task.title}" wirklich entfernen?`)) {
        appData.tasks = appData.tasks.filter(t => t.id !== task.id);
        saveData();
        renderTasks();
      }
    });

    if (isDue) {
      const clone = taskEl.cloneNode(true);
      clone.querySelector('.task-checkbox').addEventListener('change', (e) => {
        if (e.target.checked) {
          task.lastDone = new Date().toISOString();
          saveData();
          renderTasks();
        }
      });
      clone.querySelector('.btn-edit-task').addEventListener('click', () => {
        openEditTaskModal(task);
      });
      clone.querySelector('.btn-del-task').addEventListener('click', () => {
        appData.tasks = appData.tasks.filter(t => t.id !== task.id);
        saveData();
        renderTasks();
      });
      dueContainer.appendChild(clone);
    }

    allContainer.appendChild(taskEl);
  });

  if (dueContainer.children.length === 0) {
    dueContainer.innerHTML = '<div class="empty-state">🎉 Alles sauber! Heute sind keine weiteren Aufgaben fällig.</div>';
  }

  const badge = document.getElementById('badge-due');
  if (badge) {
    badge.textContent = dueCount;
    badge.style.display = dueCount > 0 ? 'inline-flex' : 'none';
  }

  renderCleaningCalendar();
}

function renderCleaningCalendar() {
  const container = document.getElementById('cleaning-calendar');
  const titleEl = document.getElementById('cal-month-title');
  if (!container || !titleEl) return;

  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth();

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  titleEl.textContent = `${monthNames[month]} ${year}`;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  let startDayOfWeek = firstDayOfMonth.getDay();
  if (startDayOfWeek === 0) startDayOfWeek = 7;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  let html = `
    <div class="cal-weekdays">
      <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
    </div>
    <div class="cal-days-grid">
  `;

  // Vormonatstage
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = 1; i < startDayOfWeek; i++) {
    const dayNum = prevMonthLastDay - (startDayOfWeek - 1 - i);
    html += `<div class="cal-day-cell other-month"><span class="cal-day-num">${dayNum}</span></div>`;
  }

  // Tage des aktuellen Monats
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = (dateStr === todayStr);
    const isSelected = (dateStr === calSelectedDateStr);

    const tasksForDay = appData.tasks.filter(t => {
      const dueStr = calculateNextDueDate(t.lastDone, t.intervalDays).slice(0, 10);
      return dueStr === dateStr;
    });

    let badgesHtml = '';
    tasksForDay.forEach(t => {
      const diff = getDaysDifference(calculateNextDueDate(t.lastDone, t.intervalDays));
      let bClass = '';
      if (diff < 0) bClass = 'overdue';
      else if (diff === 0) bClass = 'due-today';
      badgesHtml += `<div class="cal-task-badge ${bClass}" title="${t.title}">${t.title}</div>`;
    });

    html += `
      <div class="cal-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date="${dateStr}">
        <span class="cal-day-num">${d}</span>
        <div class="cal-tasks-dots">${badgesHtml}</div>
      </div>
    `;
  }

  // Folgemonatstage bis 35/42 voll
  const totalRendered = (startDayOfWeek - 1) + totalDays;
  const remaining = (7 - (totalRendered % 7)) % 7;
  for (let j = 1; j <= remaining; j++) {
    html += `<div class="cal-day-cell other-month"><span class="cal-day-num">${j}</span></div>`;
  }

  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll('.cal-day-cell[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      calSelectedDateStr = cell.dataset.date;
      renderCleaningCalendar();
      showCalendarDayDetails(calSelectedDateStr);
    });
  });
}

function showCalendarDayDetails(dateStr) {
  const detailsEl = document.getElementById('cal-selected-day-details');
  if (!detailsEl) return;

  const d = new Date(dateStr);
  const formattedDate = d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const tasksForDay = appData.tasks.filter(t => {
    const dueStr = calculateNextDueDate(t.lastDone, t.intervalDays).slice(0, 10);
    return dueStr === dateStr;
  });

  let taskListHtml = '';
  if (tasksForDay.length === 0) {
    taskListHtml = '<p class="muted-text" style="font-size:0.83rem;">Für diesen Tag sind aktuell keine Aufgaben geplant.</p>';
  } else {
    taskListHtml = tasksForDay.map(t => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; padding:0.4rem 0.6rem; border-radius:6px; margin-bottom:0.35rem; border:1px solid var(--border);">
        <div>
          <strong>${t.title}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted); display:block;">📍 ${t.floor} (${t.room || 'Allgemein'}) • ${t.surface}</span>
        </div>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-sm btn-ghost btn-cal-edit" data-id="${t.id}" title="Bearbeiten">✏️</button>
          <button class="btn btn-sm btn-primary btn-cal-done" data-id="${t.id}" title="Als erledigt markieren">✓ Erledigt</button>
        </div>
      </div>
    `).join('');
  }

  detailsEl.style.display = 'block';
  detailsEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
      <h4 style="margin:0;">📅 Aufgaben am ${formattedDate}</h4>
      <button id="btn-close-cal-details" class="btn btn-sm btn-ghost" style="padding:2px 6px;">✕</button>
    </div>
    ${taskListHtml}
    <button id="btn-plan-for-day" class="btn btn-sm btn-secondary" style="margin-top:0.3rem;">➕ Aufgabe für diesen Tag planen</button>
  `;

  const btnClose = document.getElementById('btn-close-cal-details');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      detailsEl.style.display = 'none';
      calSelectedDateStr = null;
      renderCleaningCalendar();
    });
  }

  detailsEl.querySelectorAll('.btn-cal-done').forEach(btn => {
    btn.addEventListener('click', () => {
      const task = appData.tasks.find(t => t.id === btn.dataset.id);
      if (task) {
        task.lastDone = new Date().toISOString();
        saveData();
        renderTasks();
        showCalendarDayDetails(dateStr);
      }
    });
  });

  detailsEl.querySelectorAll('.btn-cal-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const task = appData.tasks.find(t => t.id === btn.dataset.id);
      if (task) openEditTaskModal(task);
    });
  });

  const btnPlan = document.getElementById('btn-plan-for-day');
  if (btnPlan) {
    btnPlan.addEventListener('click', () => {
      document.getElementById('task-date').value = dateStr;
      document.getElementById('task-title').focus();
    });
  }
}

function openEditTaskModal(task) {
  const modal = document.getElementById('modal-edit-task');
  if (!modal) return;
  document.getElementById('edit-task-id').value = task.id;
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-floor').value = task.floor;
  document.getElementById('edit-task-room').value = task.room || '';
  document.getElementById('edit-task-surface').value = task.surface || 'alle';
  document.getElementById('edit-task-interval').value = task.intervalDays;
  document.getElementById('edit-task-notes').value = task.notes || '';

  const nextDue = calculateNextDueDate(task.lastDone, task.intervalDays).slice(0, 10);
  document.getElementById('edit-task-date').value = nextDue;

  modal.style.display = 'flex';
}

function setupTaskForm() {
  const form = document.getElementById('form-new-task');
  const floorFilter = document.getElementById('filter-floor-task');

  // Standard-Datum für neue Aufgaben = Heute
  const taskDateInput = document.getElementById('task-date');
  if (taskDateInput) {
    const today = new Date();
    taskDateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  // Kalender-Navigation
  const btnPrev = document.getElementById('btn-cal-prev');
  const btnNext = document.getElementById('btn-cal-next');
  const btnToday = document.getElementById('btn-cal-today');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
      renderCleaningCalendar();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
      renderCleaningCalendar();
    });
  }
  if (btnToday) {
    btnToday.addEventListener('click', () => {
      calCurrentDate = new Date();
      calSelectedDateStr = `${calCurrentDate.getFullYear()}-${String(calCurrentDate.getMonth() + 1).padStart(2, '0')}-${String(calCurrentDate.getDate()).padStart(2, '0')}`;
      renderCleaningCalendar();
      showCalendarDayDetails(calSelectedDateStr);
    });
  }

  // Modal Aufgabe bearbeiten
  const editModal = document.getElementById('modal-edit-task');
  const editForm = document.getElementById('form-edit-task');
  const btnCloseEdit = document.getElementById('btn-close-edit-task');
  const btnCancelEdit = document.getElementById('btn-cancel-edit-task');

  if (btnCloseEdit) btnCloseEdit.addEventListener('click', () => { editModal.style.display = 'none'; });
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', () => { editModal.style.display = 'none'; });

  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-task-id').value;
      const task = appData.tasks.find(t => t.id === id);
      if (!task) return;

      task.title = document.getElementById('edit-task-title').value.trim();
      task.floor = document.getElementById('edit-task-floor').value;
      task.room = document.getElementById('edit-task-room').value.trim() || 'Allgemein';
      task.surface = document.getElementById('edit-task-surface').value;
      task.intervalDays = parseInt(document.getElementById('edit-task-interval').value, 10) || 7;
      task.notes = document.getElementById('edit-task-notes').value.trim();

      const chosenDateStr = document.getElementById('edit-task-date').value;
      if (chosenDateStr) {
        const targetD = new Date(chosenDateStr + 'T12:00:00');
        const calculatedLastDone = new Date(targetD.getTime() - task.intervalDays * 24 * 60 * 60 * 1000);
        task.lastDone = calculatedLastDone.toISOString();
      }

      saveData();
      renderTasks();
      editModal.style.display = 'none';
      if (calSelectedDateStr) showCalendarDayDetails(calSelectedDateStr);
    });
  }

  floorFilter.addEventListener('change', renderTasks);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const floor = document.getElementById('task-floor').value;
    const room = document.getElementById('task-room').value.trim() || 'Allgemein';
    const surface = document.getElementById('task-surface').value;
    const intervalDays = parseInt(document.getElementById('task-interval').value, 10) || 7;
    const notes = document.getElementById('task-notes').value.trim();
    const taskDateStr = (document.getElementById('task-date') || {}).value;

    let lastDone = new Date().toISOString();
    if (taskDateStr) {
      const targetD = new Date(taskDateStr + 'T12:00:00');
      const calculatedLastDone = new Date(targetD.getTime() - intervalDays * 24 * 60 * 60 * 1000);
      lastDone = calculatedLastDone.toISOString();
    }

    const newTask = {
      id: 't-' + Date.now(),
      title,
      floor,
      room,
      surface,
      intervalDays,
      lastDone,
      notes
    };

    appData.tasks.push(newTask);
    saveData();
    renderTasks();
    form.reset();

    // Reset date input back to today
    if (taskDateInput) {
      const today = new Date();
      taskDateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
  });
}

// ----------------------------------------------------
// 2. 2D RAUM- & BODENPLANER (Canvas mit Umriss-Resizing & Detail-Grafiken)
// ----------------------------------------------------
const canvas = document.getElementById('floorCanvas');
const ctx = canvas.getContext('2d');

let currentTool = 'select'; // 'select' | 'room' | 'wall'
let selectedElement = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let dragStartX = 0;
let dragStartY = 0;

// 2D Zoom & Pan Zustand
let canvasZoom = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

// Resize Handles für Umriss-Änderung: 8 Punkte (NW, N, NE, E, SE, S, SW, W)
let activeResizeHandle = null;
const HANDLE_SIZE = 10;

// Verschieben der Raum-Plakette außerhalb der Zeichnung
let isDraggingBadge = false;
let badgeDragRoom = null;

function setCanvasZoom(newZoom, pivotX, pivotY) {
  const oldZoom = canvasZoom;
  const clamped = Math.max(0.4, Math.min(3.5, newZoom));
  if (Math.abs(clamped - oldZoom) < 0.001) return;

  const pX = (pivotX !== undefined) ? pivotX : canvas.width / 2;
  const pY = (pivotY !== undefined) ? pivotY : canvas.height / 2;

  panX = pX - ((pX - panX) * (clamped / oldZoom));
  panY = pY - ((pY - panY) * (clamped / oldZoom));
  canvasZoom = clamped;

  const zoomValEl = document.getElementById('canvas-zoom-val');
  if (zoomValEl) zoomValEl.textContent = Math.round(canvasZoom * 100) + '%';

  const scaleInfoEl = document.getElementById('canvas-scale-info');
  if (scaleInfoEl) scaleInfoEl.textContent = `1 m = ${Math.round(PIXELS_PER_METER * canvasZoom)} px`;

  renderCanvas();
}

function zoomToFit() {
  const elements = appData.floors[currentFloor] || [];
  if (elements.length === 0) {
    canvasZoom = 1.0;
    panX = 0;
    panY = 0;
    const zoomValEl = document.getElementById('canvas-zoom-val');
    if (zoomValEl) zoomValEl.textContent = '100%';
    renderCanvas();
    return;
  }
  let minX = 99999, maxX = -99999, minY = 99999, maxY = -99999;
  elements.forEach(el => {
    minX = Math.min(minX, el.x);
    maxX = Math.max(maxX, el.x + (el.width || (el.radius || 20) * 2));
    minY = Math.min(minY, el.y);
    maxY = Math.max(maxY, el.y + (el.height || (el.radius || 20) * 2));
  });

  const contentW = Math.max(100, maxX - minX + 120);
  const contentH = Math.max(100, maxY - minY + 120);

  const scale = Math.min((canvas.width * 0.9) / contentW, (canvas.height * 0.9) / contentH);
  canvasZoom = Math.max(0.4, Math.min(2.5, scale));
  
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  panX = canvas.width / 2 - midX * canvasZoom;
  panY = canvas.height / 2 - midY * canvasZoom;

  const zoomValEl = document.getElementById('canvas-zoom-val');
  if (zoomValEl) zoomValEl.textContent = Math.round(canvasZoom * 100) + '%';
  const scaleInfoEl = document.getElementById('canvas-scale-info');
  if (scaleInfoEl) scaleInfoEl.textContent = `1 m = ${Math.round(PIXELS_PER_METER * canvasZoom)} px`;
  renderCanvas();
}

function getResizeHandles(el) {
  if (!el) return [];
  if (el.type === 'plant') {
    const r = el.radius || 20;
    return [
      { handle: 'r-se', x: el.x + r * 0.707, y: el.y + r * 0.707 },
      { handle: 'r-e',  x: el.x + r, y: el.y },
      { handle: 'r-s',  x: el.x, y: el.y + r }
    ];
  }
  const x = el.x;
  const y = el.y;
  const w = el.width;
  const h = el.height;
  const rawHandles = [
    { handle: 'nw', x: x, y: y },
    { handle: 'n',  x: x + w / 2, y: y },
    { handle: 'ne', x: x + w, y: y },
    { handle: 'e',  x: x + w, y: y + h / 2 },
    { handle: 'se', x: x + w, y: y + h },
    { handle: 's',  x: x + w / 2, y: y + h },
    { handle: 'sw', x: x, y: y + h },
    { handle: 'w',  x: x, y: y + h / 2 }
  ];

  if (!el.rotation) return rawHandles;

  const cx = x + w / 2;
  const cy = y + h / 2;
  const rad = el.rotation * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return rawHandles.map(h => {
    const dx = h.x - cx;
    const dy = h.y - cy;
    return {
      handle: h.handle,
      x: cx + (dx * cos - dy * sin),
      y: cy + (dx * sin + dy * cos)
    };
  });
}

function getHandleUnderPoint(pt, el) {
  if (!el) return null;
  const handles = getResizeHandles(el);
  const tol = Math.max(14, 18 / canvasZoom);
  let closest = null;
  let minDist = tol;
  for (const h of handles) {
    const dist = Math.hypot(pt.x - h.x, pt.y - h.y);
    if (dist <= minDist) {
      minDist = dist;
      closest = h.handle;
    }
  }
  return closest;
}

function calculateAreaM2(widthPx, heightPx) {
  const wMeters = widthPx / PIXELS_PER_METER;
  const hMeters = heightPx / PIXELS_PER_METER;
  return parseFloat((wMeters * hMeters).toFixed(1));
}

function setupFloorplan() {
  // Floor Selector
  const floorBtns = document.querySelectorAll('.btn-floor');
  floorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      floorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFloor = btn.dataset.floor;
      selectedElement = null;
      updateInspector();
      if (activeViewMode === '3d') {
        update3DScene();
      } else {
        renderCanvas();
      }
    });
  });

  // Tool Selector & Switcher
  const toolBtns = document.querySelectorAll('.btn-tool');
  const surfaceGroup = document.getElementById('surface-selector-group');
  const bannerLeft = document.querySelector('.canvas-banner-left');

  window.updateToolBanner = function(tool) {
    if (!bannerLeft) return;
    const banner = bannerLeft.parentElement;
    if (tool === 'room') {
      banner.classList.add('drawing-active');
      bannerLeft.innerHTML = '<span>🎨 <strong>Raum zeichnen:</strong> Klicke mit der Maus auf die Fläche, halte die Taste gedrückt und ziehe dein Zimmer auf! Die m² werden live berechnet.</span>';
    } else if (tool === 'wall') {
      banner.classList.add('drawing-active');
      bannerLeft.innerHTML = '<span>🧱 <strong>Wand einziehen:</strong> Klicke und ziehe eine Trennwand mit der Maus. Sie rastet automatisch gerade ein.</span>';
    } else {
      banner.classList.remove('drawing-active');
      bannerLeft.innerHTML = '<span>💡 <strong>Auswahl & Bewegen:</strong> Klicke ein Element an, um es zu verschieben oder die Maße anzupassen. An den 8 blauen Punkten kannst du den Umriss verziehen.</span>';
    }
  };

  window.switchTool = function(toolName) {
    currentTool = toolName;
    document.querySelectorAll('.btn-tool').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === toolName);
    });
    if (surfaceGroup) {
      surfaceGroup.style.display = currentTool === 'room' ? 'flex' : 'none';
    }
    window.updateToolBanner(toolName);
  };

  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.switchTool(btn.dataset.tool);
    });
  });

  // Zeichen-Hilfe Modal Events
  const btnHelp = document.getElementById('btn-draw-help');
  const modalHelp = document.getElementById('modal-draw-help');
  const btnCloseHelp = document.getElementById('btn-close-draw-help');
  const btnGotHelp = document.getElementById('btn-got-draw-help');

  if (btnHelp && modalHelp) {
    btnHelp.addEventListener('click', () => modalHelp.style.display = 'flex');
    if (btnCloseHelp) btnCloseHelp.addEventListener('click', () => modalHelp.style.display = 'none');
    if (btnGotHelp) btnGotHelp.addEventListener('click', () => modalHelp.style.display = 'none');
  }

  // 2D Zoom-Buttons
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');
  const btnZoomFit = document.getElementById('btn-zoom-fit');

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => setCanvasZoom(canvasZoom * 1.25));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => setCanvasZoom(canvasZoom / 1.25));
  if (btnZoomReset) btnZoomReset.addEventListener('click', () => {
    canvasZoom = 1.0;
    panX = 0;
    panY = 0;
    const zoomValEl = document.getElementById('canvas-zoom-val');
    if (zoomValEl) zoomValEl.textContent = '100%';
    const scaleInfoEl = document.getElementById('canvas-scale-info');
    if (scaleInfoEl) scaleInfoEl.textContent = `1 m = ${Math.round(PIXELS_PER_METER)} px`;
    renderCanvas();
  });
  if (btnZoomFit) btnZoomFit.addEventListener('click', zoomToFit);

  // Mausrad-Zoom im Canvas
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const pivotX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const pivotY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const delta = e.deltaY < 0 ? 1.15 : 0.87;
    setCanvasZoom(canvasZoom * delta, pivotX, pivotY);
  }, { passive: false });

  // Canvas Mouse & Touch Events
  canvas.addEventListener('mousemove', handleCanvasMouseMove);
  canvas.addEventListener('mousedown', handleCanvasMouseDown);
  window.addEventListener('mouseup', handleCanvasMouseUp);

  let touchStartDistance = 0;
  let touchStartZoom = 1.0;
  let isPinching = false;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      isPinching = true;
      isDrawing = false;
      isPanning = false;
      touchStartDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartZoom = canvasZoom;
      return;
    }

    if (currentTool === 'room' || currentTool === 'wall') {
      e.preventDefault();
      handleCanvasMouseDown(e);
      return;
    }

    const pt = getCanvasPoint(e);
    const hitHandle = selectedElement ? getHandleUnderPoint(pt, selectedElement) : null;
    const hitElement = findElementUnderPoint(pt);

    if (hitHandle || (hitElement && hitElement.type !== 'room')) {
      e.preventDefault();
      handleCanvasMouseDown(e);
    } else if (hitElement && hitElement.type === 'room') {
      // Raum auf Touchscreen nur auswählen, aber Touchmove soll die Ansicht verschieben (Pan)
      selectedElement = hitElement;
      updateInspector();
      renderCanvas();
      const rect = canvas.getBoundingClientRect();
      isPanning = true;
      panStartX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
      panStartY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    } else {
      // Leerer Bereich berührt => Pan
      const rect = canvas.getBoundingClientRect();
      isPanning = true;
      panStartX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
      panStartY = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const curDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStartDistance > 0) {
        const rect = canvas.getBoundingClientRect();
        const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) * (canvas.width / rect.width);
        const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) * (canvas.height / rect.height);
        setCanvasZoom(touchStartZoom * (curDist / touchStartDistance), midX, midY);
      }
      return;
    }

    if (isDrawing || activeResizeHandle || isDraggingBadge || isPanning) {
      e.preventDefault();
      handleCanvasMouseMove(e);
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      isPinching = false;
    }
    if (isDrawing || isDraggingBadge || isPanning) {
      handleCanvasMouseUp(e);
    }
  });

  // Auswahlpool Klick-Events (Möbel & Elemente hinzufügen)
  setupCatalogItems();

  // Toolbar Toggle für Katalog auf mobilen Screens
  document.getElementById('btn-toggle-catalog').addEventListener('click', () => {
    const sidebar = document.getElementById('furniture-catalog');
    sidebar.style.display = (sidebar.style.display === 'none') ? 'flex' : 'none';
  });

  // Clear Floor
  document.getElementById('btn-clear-floor').addEventListener('click', () => {
    if (confirm(`Alle Elemente auf Etage "${currentFloor}" wirklich löschen?`)) {
      appData.floors[currentFloor] = [];
      selectedElement = null;
      saveData();
      updateInspector();
      renderCanvas();
    }
  });

  // Reset Sample Plan
  document.getElementById('btn-reset-sample-plan').addEventListener('click', () => {
    if (confirm(`Muster-Grundriss für "${currentFloor}" wiederherstellen?`)) {
      appData.floors[currentFloor] = JSON.parse(JSON.stringify(SAMPLE_DATA.floors[currentFloor] || []));
      selectedElement = null;
      saveData();
      updateInspector();
      renderCanvas();
    }
  });
}

// Berechnet Position und Abmessungen der Raum-Beschriftungs-Plakette
// Liegt standardmäßig AUßERHALB des Raumes (oberhalb oder unterhalb), damit der Raum frei für Möbel bleibt!
function getRoomBadgeRect(room) {
  const m2 = room.areaM2 || calculateAreaM2(room.width, room.height);
  const wM = (room.width / PIXELS_PER_METER).toFixed(1);
  const hM = (room.height / PIXELS_PER_METER).toFixed(1);
  const titleText = `${room.name}`;
  const subText = `${m2} m² (${wM} m × ${hM} m) • ${(room.surface || 'laminat').toUpperCase()}`;

  const estTitleW = titleText.length * 8.5;
  const estSubW = subText.length * 6.8;
  const badgeW = Math.round(Math.max(160, Math.max(estTitleW, estSubW) + 28));
  const badgeH = 40;

  let bx, by;
  if (room.badgeCustomX !== undefined && room.badgeCustomY !== undefined) {
    bx = room.badgeCustomX;
    by = room.badgeCustomY;
  } else if (room.badgePos === 'inside') {
    bx = room.x + 10;
    by = room.y + 10;
  } else if (room.badgePos === 'outside-bottom') {
    bx = room.x;
    by = room.y + room.height + 12;
  } else if (room.badgePos === 'outside-left') {
    bx = room.x - badgeW - 12;
    by = room.y;
  } else if (room.badgePos === 'outside-right') {
    bx = room.x + room.width + 12;
    by = room.y;
  } else {
    // Standard: 'outside-top' (AUßERHALB oberhalb des Raumes)
    bx = room.x;
    by = (room.y >= badgeH + 12) ? (room.y - badgeH - 10) : (room.y + room.height + 12);
  }

  return { x: bx, y: by, width: badgeW, height: badgeH, titleText, subText };
}

// Präzise Prüfung, ob ein Punkt (pt) innerhalb eines Elements liegt (inkl. Drehung und Berücksichtigung von Touch/Klick-Toleranz)
function isPointInElement(pt, el) {
  if (el.type === 'plant') {
    const dist = Math.hypot(el.x - pt.x, el.y - pt.y);
    const tol = Math.max(18, Math.round(24 / canvasZoom));
    return dist <= ((el.radius || 20) + tol);
  }

  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  let checkX = pt.x;
  let checkY = pt.y;

  if (el.rotation) {
    const rad = -el.rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = pt.x - cx;
    const dy = pt.y - cy;
    checkX = cx + (dx * cos - dy * sin);
    checkY = cy + (dx * sin + dy * cos);
  }

  // Großzügige Klicktoleranz (mindestens 18-26px je nach Zoom)
  const tol = Math.max(16, Math.round(22 / canvasZoom));
  const tolX = Math.max(tol, (el.width <= 32 ? 26 : 12));
  const tolY = Math.max(tol, (el.height <= 32 ? 26 : 12));

  return (
    checkX >= el.x - tolX &&
    checkX <= el.x + el.width + tolX &&
    checkY >= el.y - tolY &&
    checkY <= el.y + el.height + tolY
  );
}

function findElementUnderPoint(pt) {
  const elements = appData.floors[currentFloor] || [];

  // TIER 1: Pflanzen, Möbel (Waschtisch, Couch, Tisch, WC etc.), Türen, Fenster, Trennwände
  // Höchste Priorität! Objekte, die auf dem Boden stehen, müssen IMMER vor dem Raum gegriffen werden.
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.type === 'room') continue;
    if (el.subType === 'fliesen_zone' || el.subType === 'teppich_insel') continue;

    if (isPointInElement(pt, el)) {
      return el;
    }
  }

  // TIER 2: Teppiche & Küchenfliesen-Zonen (liegen auf dem Raum, aber unter Möbeln)
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.subType === 'fliesen_zone' || el.subType === 'teppich_insel') {
      if (isPointInElement(pt, el)) return el;
    }
  }

  // TIER 3: Raum-Beschriftungs-Plaketten
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.type === 'room' && el.badgePos !== 'hidden') {
      const bRect = getRoomBadgeRect(el);
      if (pt.x >= bRect.x && pt.x <= bRect.x + bRect.width &&
          pt.y >= bRect.y && pt.y <= bRect.y + bRect.height) {
        return el;
      }
    }
  }

  // TIER 4: Raum-Bodenfläche (wird nur ausgewählt, aber nicht versehentlich verschoben)
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.type === 'room') {
      if (pt.x >= el.x && pt.x <= el.x + el.width && pt.y >= el.y && pt.y <= el.y + el.height) {
        return el;
      }
    }
  }

  return null;
}

// Auswahlpool Initialisierung
function setupCatalogItems() {
  const items = document.querySelectorAll('.catalog-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      const label = item.dataset.label || 'Objekt';
      const w = parseInt(item.dataset.w, 10) || 120;
      const h = parseInt(item.dataset.h, 10) || 80;

      // Intelligenten Platzierungspunkt berechnen:
      // Falls ein Raum vorhanden/ausgewählt ist, platziere Fenster direkt an der Wand!
      let spawnX, spawnY;
      const isWindow = (type === 'fenster' || type === 'fenster_gross');
      const isDoor = (type === 'tuer');

      const viewCenterX = Math.round((-panX + canvas.width / 2) / canvasZoom);
      const viewCenterY = Math.round((-panY + canvas.height / 2) / canvasZoom);

      const targetRoom = (selectedElement && selectedElement.type === 'room')
        ? selectedElement
        : (appData.floors[currentFloor] || []).find(el => el.type === 'room');

      if ((isWindow || isDoor) && targetRoom) {
        // Am oberen Rand (Nordwand) des Raumes andocken
        spawnX = Math.round(targetRoom.x + (targetRoom.width - w) / 2);
        spawnY = Math.round(targetRoom.y - h / 2);
      } else if (targetRoom && type !== 'wand_h' && type !== 'wand_v') {
        if (type.startsWith('pflanze_')) {
          // Pflanzen harmonisch im Raum platzieren
          spawnX = Math.round(targetRoom.x + targetRoom.width * 0.7 - w / 2);
          spawnY = Math.round(targetRoom.y + targetRoom.height * 0.3 - h / 2);
        } else {
          // Möbel zentriert im Raum platzieren
          spawnX = Math.round(targetRoom.x + (targetRoom.width - w) / 2);
          spawnY = Math.round(targetRoom.y + (targetRoom.height - h) / 2);
        }
      } else {
        // Im aktuellen sichtbaren Bildbereich platzieren!
        spawnX = viewCenterX - Math.round(w / 2);
        spawnY = viewCenterY - Math.round(h / 2);
      }

      let newElement = null;
      if (type === 'room_with_door') {
        // Raum inklusive Wand & Tür hinzufügen
        const area = calculateAreaM2(w, h);
        const surface = (document.getElementById('fp-surface-type') || {}).value || 'laminat';
        const newRoom = {
          id: 'r-' + Date.now(),
          type: 'room',
          name: `Neues Zimmer (${area} m²)`,
          surface,
          x: spawnX,
          y: spawnY,
          width: w,
          height: h,
          areaM2: area,
          badgePos: 'outside-top'
        };

        const newDoor = {
          id: 'f-door-' + Date.now(),
          type: 'furniture',
          subType: 'tuer',
          label: 'Zimmertür',
          x: spawnX + Math.round((w - 70) / 2),
          y: spawnY + h - 10,
          width: 70,
          height: 20,
          swingIn: true,
          hinge: 'left'
        };

        if (!appData.floors[currentFloor]) appData.floors[currentFloor] = [];
        appData.floors[currentFloor].push(newRoom);
        appData.floors[currentFloor].push(newDoor);
        selectedElement = newRoom;

        if (window.switchTool) window.switchTool('select');
        saveData();
        updateInspector();
        if (activeViewMode === '3d') update3DScene();
        else renderCanvas();
        return;

      } else if (type.startsWith('pflanze_')) {
        newElement = {
          id: 'p-' + Date.now(),
          type: 'plant',
          subType: type,
          name: label,
          x: spawnX + w / 2,
          y: spawnY + h / 2,
          radius: Math.round(w / 2)
        };
      } else if (type === 'wand_h' || type === 'wand_v') {
        newElement = {
          id: 'w-' + Date.now(),
          type: 'wall',
          x: spawnX,
          y: spawnY,
          width: w,
          height: h,
          label: label,
          rotation: (type === 'wand_v') ? 90 : 0
        };
      } else if (type === 'treppe_auf' || type === 'treppe_ab') {
        const nextTarget = (type === 'treppe_auf')
          ? (currentFloor === 'EG' ? '1.OG' : '2.OG')
          : (currentFloor === '2.OG' ? '1.OG' : 'EG');
        newElement = {
          id: 'f-' + Date.now(),
          type: 'furniture',
          subType: type,
          targetFloor: nextTarget,
          stairDirection: (type === 'treppe_ab') ? 'down' : 'up',
          stairRunDirection: 'east',
          label: label,
          x: spawnX,
          y: spawnY,
          width: w,
          height: h
        };
      } else {
        newElement = {
          id: 'f-' + Date.now(),
          type: 'furniture',
          subType: type,
          label: label,
          x: spawnX,
          y: spawnY,
          width: w,
          height: h
        };
      }

      if (!appData.floors[currentFloor]) appData.floors[currentFloor] = [];
      appData.floors[currentFloor].push(newElement);
      selectedElement = newElement;

      // WICHTIG: Sofort auf das "Auswählen & Bewegen"-Werkzeug umschalten,
      // damit der Benutzer das neue Fenster/Möbelstück direkt greifen und verschieben kann!
      if (window.switchTool) {
        window.switchTool('select');
      } else {
        currentTool = 'select';
      }

      saveData();
      updateInspector();
      if (activeViewMode === '3d') {
        update3DScene();
      } else {
        renderCanvas();
      }
    });
  });
}

function getCanvasPoint(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  // Unterstützt Maus- und Touch-Events (Finger/Apple Pencil auf iPad)
  const clientX = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientY : evt.clientY;

  const rawX = (clientX - rect.left) * scaleX;
  const rawY = (clientY - rect.top) * scaleY;

  return {
    x: Math.round((rawX - panX) / canvasZoom),
    y: Math.round((rawY - panY) / canvasZoom)
  };
}

function handleCanvasMouseMove(evt) {
  const rect = canvas.getBoundingClientRect();
  const clientX = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientY : evt.clientY;
  const rawX = (clientX - rect.left) * (canvas.width / rect.width);
  const rawY = (clientY - rect.top) * (canvas.height / rect.height);

  if (isPanning) {
    panX += (rawX - panStartX);
    panY += (rawY - panStartY);
    panStartX = rawX;
    panStartY = rawY;
    renderCanvas();
    return;
  }

  const pt = getCanvasPoint(evt);
  const meterX = (pt.x / PIXELS_PER_METER).toFixed(1);
  const meterY = (pt.y / PIXELS_PER_METER).toFixed(1);
  document.getElementById('canvas-coords').textContent = `X: ${meterX} m, Y: ${meterY} m`;

  // Cursor anpassen falls über Resize-Handle oder Raum-Plakette
  if (selectedElement && !isDrawing && !isDraggingBadge) {
    const handle = getHandleUnderPoint(pt, selectedElement);
    if (handle) {
      if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
      else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
      else if (handle === 'n' || handle === 's') canvas.style.cursor = 'ns-resize';
      else if (handle === 'e' || handle === 'w') canvas.style.cursor = 'ew-resize';
    } else {
      let isOverBadge = false;
      const floorElements = appData.floors[currentFloor] || [];
      for (const el of floorElements) {
        if (el.type === 'room' && el.badgePos !== 'hidden') {
          const bRect = getRoomBadgeRect(el);
          if (pt.x >= bRect.x && pt.x <= bRect.x + bRect.width && pt.y >= bRect.y && pt.y <= bRect.y + bRect.height) {
            isOverBadge = true;
            break;
          }
        }
      }
      canvas.style.cursor = isOverBadge ? 'move' : (currentTool === 'room' || currentTool === 'wall' ? 'crosshair' : 'default');
    }
  }

  // Raum-Plakette frei verschieben
  if (isDraggingBadge && badgeDragRoom) {
    canvas.style.cursor = 'move';
    const dx = pt.x - dragStartX;
    const dy = pt.y - dragStartY;
    dragStartX = pt.x;
    dragStartY = pt.y;

    const bRect = getRoomBadgeRect(badgeDragRoom);
    badgeDragRoom.badgeCustomX = (badgeDragRoom.badgeCustomX !== undefined ? badgeDragRoom.badgeCustomX : bRect.x) + dx;
    badgeDragRoom.badgeCustomY = (badgeDragRoom.badgeCustomY !== undefined ? badgeDragRoom.badgeCustomY : bRect.y) + dy;
    renderCanvas();
    return;
  }

  if (isDrawing && activeResizeHandle && selectedElement) {
    const el = selectedElement;

    // Pflanzen-Radius mit Griff vergrößern / verkleinern
    if (el.type === 'plant' && activeResizeHandle.startsWith('r')) {
      const dist = Math.hypot(pt.x - el.x, pt.y - el.y);
      el.radius = Math.max(10, Math.min(220, Math.round(dist)));
      renderCanvas();
      return;
    }

    // Umriss durch Ziehen am Griff verändern!
    const dx = pt.x - dragStartX;
    const dy = pt.y - dragStartY;
    dragStartX = pt.x;
    dragStartY = pt.y;

    const minSize = 10;

    if (activeResizeHandle.includes('e')) {
      el.width = Math.max(minSize, el.width + dx);
    }
    if (activeResizeHandle.includes('s')) {
      el.height = Math.max(minSize, el.height + dy);
    }
    if (activeResizeHandle.includes('w')) {
      const newW = el.width - dx;
      if (newW >= minSize) {
        el.x += dx;
        el.width = newW;
      }
    }
    if (activeResizeHandle.includes('n')) {
      const newH = el.height - dy;
      if (newH >= minSize) {
        el.y += dy;
        el.height = newH;
      }
    }

    if (el.type === 'room') {
      el.areaM2 = calculateAreaM2(el.width, el.height);
    }

    renderCanvas();

  } else if (isDrawing && currentTool === 'room') {
    renderCanvas();
    const w = pt.x - startX;
    const h = pt.y - startY;
    const m2 = calculateAreaM2(Math.abs(w), Math.abs(h));

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(canvasZoom, canvasZoom);
    ctx.strokeStyle = '#8c7355';
    ctx.lineWidth = 2 / canvasZoom;
    ctx.setLineDash([6, 4]);
    ctx.fillStyle = 'rgba(140, 115, 85, 0.15)';
    ctx.fillRect(startX, startY, w, h);
    ctx.strokeRect(startX, startY, w, h);

    // Live m² Tooltip
    ctx.fillStyle = '#2d2823';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`${(Math.abs(w)/PIXELS_PER_METER).toFixed(1)}m × ${(Math.abs(h)/PIXELS_PER_METER).toFixed(1)}m = ${m2} m²`, pt.x + 10, pt.y - 10);
    ctx.restore();

  } else if (isDrawing && currentTool === 'wall') {
    renderCanvas();
    const w = pt.x - startX;
    const h = pt.y - startY;
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(canvasZoom, canvasZoom);
    ctx.fillStyle = 'rgba(51, 65, 85, 0.7)';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2 / canvasZoom;
    const drawW = Math.abs(w) > Math.abs(h) ? w : (w >= 0 ? 14 : -14);
    const drawH = Math.abs(w) > Math.abs(h) ? (h >= 0 ? 14 : -14) : h;
    ctx.fillRect(startX, startY, drawW, drawH);
    ctx.strokeRect(startX, startY, drawW, drawH);
    ctx.restore();

  } else if (isDrawing && selectedElement && !activeResizeHandle) {
    if (selectedElement.type === 'room') {
      // WICHTIG: Raum-Bodenfläche wird beim Ziehen NICHT verschoben!
      // Das schützt die gesamte Raumaufteilung und verhindert, dass man
      // versehentlich den Raum verschiebt, wenn man Möbel oder Pflanzen greift.
      return;
    }

    // Ganzes Element verschieben (flüssig ohne DOM-Neuaufbau während der Mausbewegung)
    const dx = pt.x - dragStartX;
    const dy = pt.y - dragStartY;
    dragStartX = pt.x;
    dragStartY = pt.y;

    selectedElement.x += dx;
    selectedElement.y += dy;
    renderCanvas();
  }
}

function handleCanvasMouseDown(evt) {
  const pt = getCanvasPoint(evt);

  // 1. Zuerst prüfen, ob ein Resize-Handle des aktiven Elements geklickt wurde
  if (selectedElement) {
    const handle = getHandleUnderPoint(pt, selectedElement);
    if (handle) {
      isDrawing = true;
      activeResizeHandle = handle;
      dragStartX = pt.x;
      dragStartY = pt.y;
      return;
    }
  }

  // 1b. Prüfen, ob eine Raum-Beschriftungs-Plakette angeklickt wurde => Frei verschiebbar!
  const floorElements = appData.floors[currentFloor] || [];
  for (let i = floorElements.length - 1; i >= 0; i--) {
    const el = floorElements[i];
    if (el.type === 'room' && el.badgePos !== 'hidden') {
      const bRect = getRoomBadgeRect(el);
      if (pt.x >= bRect.x && pt.x <= bRect.x + bRect.width &&
          pt.y >= bRect.y && pt.y <= bRect.y + bRect.height) {
        selectedElement = el;
        isDraggingBadge = true;
        badgeDragRoom = el;
        dragStartX = pt.x;
        dragStartY = pt.y;
        if (currentTool !== 'select' && window.switchTool) {
          window.switchTool('select');
        }
        updateInspector();
        renderCanvas();
        return;
      }
    }
  }

  // 2. Prüfen, ob ein Element angeklickt wurde (Fenster, Möbel, Wand, Pflanze, Raum)
  const clickedEl = findElementUnderPoint(pt);

  if (clickedEl) {
    selectedElement = clickedEl;
    activeResizeHandle = null;

    // Wenn ein Element angeklickt wird, immer in den Auswahl- & Verschieben-Modus schalten
    if (currentTool !== 'select' && window.switchTool) {
      window.switchTool('select');
    }

    if (clickedEl.type === 'room') {
      // Raum-Boden angeklickt => Raum wird ausgewählt, aber Ziehen auf dem Boden
      // verschiebt den Raum NICHT, sondern verschiebt die Ansicht (Pan) oder tut nichts!
      isDrawing = false;
      const rect = canvas.getBoundingClientRect();
      const clientX = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientY : evt.clientY;
      isPanning = true;
      panStartX = (clientX - rect.left) * (canvas.width / rect.width);
      panStartY = (clientY - rect.top) * (canvas.height / rect.height);
    } else {
      isDrawing = true;
      dragStartX = pt.x;
      dragStartY = pt.y;
    }

    updateInspector();
    renderCanvas();
    return;
  }

  // 3. Wenn auf freie Fläche geklickt wurde:
  if (currentTool === 'room' || currentTool === 'wall') {
    isDrawing = true;
    startX = pt.x;
    startY = pt.y;
  } else {
    // Freie Fläche im Auswahlmodus angeklickt => Abwählen oder Canvas verschieben (Pan)
    selectedElement = null;
    activeResizeHandle = null;
    updateInspector();
    renderCanvas();

    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientY : evt.clientY;
    isPanning = true;
    panStartX = (clientX - rect.left) * (canvas.width / rect.width);
    panStartY = (clientY - rect.top) * (canvas.height / rect.height);
  }
}

function handleCanvasMouseUp(evt) {
  if (isPanning) {
    isPanning = false;
    return;
  }
  if (isDraggingBadge) {
    isDraggingBadge = false;
    badgeDragRoom = null;
    saveData();
    updateInspector();
    renderCanvas();
    return;
  }
  if (!isDrawing) return;
  isDrawing = false;
  activeResizeHandle = null;

  if (currentTool === 'room') {
    const pt = getCanvasPoint(evt);
    const w = Math.abs(pt.x - startX);
    const h = Math.abs(pt.y - startY);
    if (w > 25 && h > 25) {
      const surface = document.getElementById('fp-surface-type').value;
      const x = Math.min(startX, pt.x);
      const y = Math.min(startY, pt.y);
      const area = calculateAreaM2(w, h);

      const newRoom = {
        id: 'r-' + Date.now(),
        type: 'room',
        name: `Raum (${area} m²)`,
        surface,
        x,
        y,
        width: w,
        height: h,
        areaM2: area,
        badgePos: 'outside-top'
      };

      // Automatisch Zimmertür an der Wand inklusive
      const doorW = Math.min(70, Math.round(w * 0.35));
      const newDoor = {
        id: 'f-door-' + Date.now(),
        type: 'furniture',
        subType: 'tuer',
        label: 'Zimmertür',
        x: x + Math.round((w - doorW) / 2),
        y: y + h - 10,
        width: doorW,
        height: 20,
        swingIn: true,
        hinge: 'left'
      };

      if (!appData.floors[currentFloor]) appData.floors[currentFloor] = [];
      appData.floors[currentFloor].push(newRoom);
      appData.floors[currentFloor].push(newDoor);
      selectedElement = newRoom;
      if (window.switchTool) window.switchTool('select');
      saveData();
      updateInspector();
      if (activeViewMode === '3d') update3DScene();
    }
  } else if (currentTool === 'wall') {
    const pt = getCanvasPoint(evt);
    let w = Math.abs(pt.x - startX);
    let h = Math.abs(pt.y - startY);
    let x = Math.min(startX, pt.x);
    let y = Math.min(startY, pt.y);

    if (w > 15 || h > 15) {
      if (w > h) {
        h = 14;
      } else {
        w = 14;
      }

      const newWall = {
        id: 'w-' + Date.now(),
        type: 'wall',
        x,
        y,
        width: Math.max(14, w),
        height: Math.max(14, h),
        label: 'Trennwand'
      };

      if (!appData.floors[currentFloor]) appData.floors[currentFloor] = [];
      appData.floors[currentFloor].push(newWall);
      selectedElement = newWall;
      if (window.switchTool) window.switchTool('select');
      saveData();
      updateInspector();
      if (activeViewMode === '3d') update3DScene();
    }
  } else {
    // Verschieben oder Skalieren beendet => Jetzt speichern & Inspektor synchronisieren
    saveData();
    updateInspector();
    if (activeViewMode === '3d') update3DScene();
  }
  renderCanvas();
}

// ----------------------------------------------------
// FOTO-TEXTUR-VERWALTUNG & QUADRATISCHER CROPPER
// ----------------------------------------------------
const textureImageCache = new Map();

function getCachedImage(dataUrl) {
  if (!dataUrl) return null;
  if (textureImageCache.has(dataUrl)) {
    const img = textureImageCache.get(dataUrl);
    if (img.complete && img.naturalWidth > 0) return img;
    return null;
  }
  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    renderCanvas();
    if (activeViewMode === '3d') update3DScene();
  };
  textureImageCache.set(dataUrl, img);
  return null;
}

// Erzeugt realistische Muster-Kacheln als DataURL (für Sofort-Test)
function getPresetSampleTexture(type) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const cx = c.getContext('2d');

  if (type === 'eiche') {
    // Warmes Eichenparkett mit Holzmaserung
    cx.fillStyle = '#d97706';
    cx.fillRect(0, 0, 128, 128);
    cx.fillStyle = '#b45309';
    for (let i = 0; i < 128; i += 32) {
      cx.fillRect(0, i, 128, 2);
    }
    cx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
    cx.lineWidth = 1.5;
    for (let y = 4; y < 128; y += 8) {
      cx.beginPath();
      cx.moveTo(0, y);
      cx.bezierCurveTo(40, y + 4, 80, y - 4, 128, y);
      cx.stroke();
    }
  } else if (type === 'marmor') {
    // Edler weißer Carrara-Marmor mit feinen grauen Adern
    cx.fillStyle = '#f8fafc';
    cx.fillRect(0, 0, 128, 128);
    cx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(10, 0); cx.bezierCurveTo(30, 40, 70, 60, 120, 128); cx.stroke();
    cx.beginPath();
    cx.moveTo(110, 0); cx.bezierCurveTo(80, 50, 50, 90, 0, 100); cx.stroke();
    cx.strokeStyle = '#cbd5e1';
    cx.strokeRect(0, 0, 128, 128); // Fugenkante
  } else if (type === 'teppich') {
    // Weicher Berber-Teppich mit Wollstruktur
    cx.fillStyle = '#e2e8f0';
    cx.fillRect(0, 0, 128, 128);
    cx.fillStyle = '#94a3b8';
    for (let x = 2; x < 128; x += 6) {
      for (let y = 2; y < 128; y += 6) {
        cx.fillRect(x + ((y % 12 === 0) ? 3 : 0), y, 2, 3);
      }
    }
  } else if (type === 'samt') {
    // Anthrazit Samt / Textil-Polsterstoff
    cx.fillStyle = '#475569';
    cx.fillRect(0, 0, 128, 128);
    cx.fillStyle = '#334155';
    for (let x = 0; x < 128; x += 4) {
      for (let y = 0; y < 128; y += 4) {
        if ((x + y) % 8 === 0) cx.fillRect(x, y, 2, 2);
      }
    }
  } else if (type === 'beton') {
    // Sichtbeton / Putzstruktur mit feiner Körnung
    cx.fillStyle = '#94a3b8';
    cx.fillRect(0, 0, 128, 128);
    cx.fillStyle = '#64748b';
    for (let i = 0; i < 400; i++) {
      const rx = (i * 37) % 128;
      const ry = (i * 59) % 128;
      cx.fillRect(rx, ry, 1, 1);
    }
  } else if (type === 'tapete') {
    // Elegante weiße / beige Textiltapete mit Streifenstruktur
    cx.fillStyle = '#f8fafc';
    cx.fillRect(0, 0, 128, 128);
    cx.fillStyle = '#e2e8f0';
    for (let x = 0; x < 128; x += 16) {
      cx.fillRect(x, 0, 8, 128);
    }
  } else if (type === 'klinker') {
    // Ziegelwand / Klinker
    cx.fillStyle = '#991b1b';
    cx.fillRect(0, 0, 128, 128);
    cx.fillStyle = '#cbd5e1';
    for (let y = 0; y < 128; y += 16) {
      cx.fillRect(0, y, 128, 2);
      const off = (y % 32 === 0) ? 0 : 16;
      for (let x = off; x < 128; x += 32) {
        cx.fillRect(x, y, 2, 16);
      }
    }
  }
  return c.toDataURL('image/jpeg', 0.9);
}

// Modal & Crop-State
let cropSourceImage = null;
let cropTargetElement = null;
let cropBox = { x: 50, y: 50, size: 180 };
let isDraggingCrop = false;
let cropDragStart = { x: 0, y: 0 };
let cropCanvasEl = null;
let cropCtx = null;

function setupCropModalEvents() {
  cropCanvasEl = document.getElementById('cropCanvas');
  if (!cropCanvasEl) return;
  cropCtx = cropCanvasEl.getContext('2d');

  // Input File Change
  const cameraInput = document.getElementById('camera-texture-input');
  cameraInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        openCropModal(img, selectedElement);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
    cameraInput.value = ''; // Reset
  });

  // Slider Zoom
  const zoomSlider = document.getElementById('crop-zoom');
  const zoomLabel = document.getElementById('crop-zoom-label');
  zoomSlider.addEventListener('input', (e) => {
    const s = parseInt(e.target.value, 10);
    cropBox.size = s;
    zoomLabel.textContent = s + ' px';
    clampCropBox();
    renderCropCanvas();
  });

  // Canvas Mouse Dragging
  cropCanvasEl.addEventListener('mousedown', (e) => {
    const rect = cropCanvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= cropBox.x && x <= cropBox.x + cropBox.size && y >= cropBox.y && y <= cropBox.y + cropBox.size) {
      isDraggingCrop = true;
      cropDragStart = { x: x - cropBox.x, y: y - cropBox.y };
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingCrop) return;
    const rect = cropCanvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cropBox.x = x - cropDragStart.x;
    cropBox.y = y - cropDragStart.y;
    clampCropBox();
    renderCropCanvas();
  });

  window.addEventListener('mouseup', () => {
    isDraggingCrop = false;
  });

  // Close / Cancel
  document.getElementById('btn-close-texture-modal').addEventListener('click', closeCropModal);
  document.getElementById('btn-cancel-texture').addEventListener('click', closeCropModal);

  // Apply Texture
  document.getElementById('btn-apply-texture').addEventListener('click', () => {
    if (!cropSourceImage || !cropTargetElement) return;

    // Full-Res Bildausschnitt auf 256x256 herausschneiden
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 256;
    exportCanvas.height = 256;
    const expCtx = exportCanvas.getContext('2d');

    // Umrechnung CropBox-Koordinaten zurück auf Original-Bildgröße
    const scale = Math.min(cropCanvasEl.width / cropSourceImage.width, cropCanvasEl.height / cropSourceImage.height);
    const offsetX = (cropCanvasEl.width - cropSourceImage.width * scale) / 2;
    const offsetY = (cropCanvasEl.height - cropSourceImage.height * scale) / 2;

    const sourceX = (cropBox.x - offsetX) / scale;
    const sourceY = (cropBox.y - offsetY) / scale;
    const sourceSize = cropBox.size / scale;

    expCtx.drawImage(
      cropSourceImage,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, 256, 256
    );

    const textureDataUrl = exportCanvas.toDataURL('image/jpeg', 0.88);
    cropTargetElement.textureImg = textureDataUrl;

    saveData();
    closeCropModal();
    updateInspector();
    renderCanvas();
    if (activeViewMode === '3d') update3DScene();
  });
}

function clampCropBox() {
  cropBox.size = Math.min(cropBox.size, cropCanvasEl.width, cropCanvasEl.height);
  cropBox.x = Math.max(0, Math.min(cropBox.x, cropCanvasEl.width - cropBox.size));
  cropBox.y = Math.max(0, Math.min(cropBox.y, cropCanvasEl.height - cropBox.size));
}

function openCropModal(img, targetEl) {
  cropSourceImage = img;
  cropTargetElement = targetEl;
  cropBox = { x: 50, y: 50, size: 180 };
  document.getElementById('crop-zoom').value = 180;
  document.getElementById('crop-zoom-label').textContent = '180 px';

  document.getElementById('modal-texture-crop').style.display = 'flex';
  renderCropCanvas();
}

function closeCropModal() {
  document.getElementById('modal-texture-crop').style.display = 'none';
  cropSourceImage = null;
  cropTargetElement = null;
}

function renderCropCanvas() {
  if (!cropCtx || !cropSourceImage) return;

  cropCtx.clearRect(0, 0, cropCanvasEl.width, cropCanvasEl.height);

  // Bild skaliert einpassen
  const scale = Math.min(cropCanvasEl.width / cropSourceImage.width, cropCanvasEl.height / cropSourceImage.height);
  const w = cropSourceImage.width * scale;
  const h = cropSourceImage.height * scale;
  const x = (cropCanvasEl.width - w) / 2;
  const y = (cropCanvasEl.height - h) / 2;

  cropCtx.drawImage(cropSourceImage, x, y, w, h);

  // Abgedunkelter Masken-Hintergrund
  cropCtx.save();
  cropCtx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  cropCtx.fillRect(0, 0, cropCanvasEl.width, cropCanvasEl.height);

  // Quadratischen Ausschnitt freistellen
  cropCtx.globalCompositeOperation = 'destination-out';
  cropCtx.fillRect(cropBox.x, cropBox.y, cropBox.size, cropBox.size);
  cropCtx.restore();

  // Weiß-blauer Rahmen um den quadratischen Ausschnitt
  cropCtx.save();
  cropCtx.strokeStyle = '#38bdf8';
  cropCtx.lineWidth = 2.5;
  cropCtx.setLineDash([6, 4]);
  cropCtx.strokeRect(cropBox.x, cropBox.y, cropBox.size, cropBox.size);

  // Drittel-Raster (Foto-Führungslinien)
  cropCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  cropCtx.lineWidth = 1;
  cropCtx.setLineDash([]);
  const third = cropBox.size / 3;
  cropCtx.beginPath();
  cropCtx.moveTo(cropBox.x + third, cropBox.y);
  cropCtx.lineTo(cropBox.x + third, cropBox.y + cropBox.size);
  cropCtx.moveTo(cropBox.x + third * 2, cropBox.y);
  cropCtx.lineTo(cropBox.x + third * 2, cropBox.y + cropBox.size);
  cropCtx.moveTo(cropBox.x, cropBox.y + third);
  cropCtx.lineTo(cropBox.x + cropBox.size, cropBox.y + third);
  cropCtx.moveTo(cropBox.x, cropBox.y + third * 2);
  cropCtx.lineTo(cropBox.x + cropBox.size, cropBox.y + third * 2);
  cropCtx.stroke();

  // Eck-Marker
  cropCtx.fillStyle = '#ffffff';
  const cSize = 6;
  cropCtx.fillRect(cropBox.x - cSize/2, cropBox.y - cSize/2, cSize, cSize);
  cropCtx.fillRect(cropBox.x + cropBox.size - cSize/2, cropBox.y - cSize/2, cSize, cSize);
  cropCtx.fillRect(cropBox.x - cSize/2, cropBox.y + cropBox.size - cSize/2, cSize, cSize);
  cropCtx.fillRect(cropBox.x + cropBox.size - cSize/2, cropBox.y + cropBox.size - cSize/2, cSize, cSize);

  cropCtx.restore();
}

// ----------------------------------------------------
// DETAILLIERTE 2D ZEICHENROUTINEN
// ----------------------------------------------------

// 1. Bodenbelagsmuster
function drawSurfacePattern(ctx, surface, x, y, width, height, textureImg, textureScaleCm = 40) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  // Falls eine eigene Foto-Textur hinterlegt ist, diese maßstabsgetreu kacheln
  if (textureImg) {
    const img = getCachedImage(textureImg);
    if (img && img.naturalWidth > 0) {
      const pattern = ctx.createPattern(img, 'repeat');
      if (pattern) {
        // Umrechnung: Wie viele Pixel im Canvas entsprechen der realen Kachelgröße?
        // PIXELS_PER_METER = 40px => 100cm = 40px => 1cm = 0.4px.
        // Eine 40x40cm Fliese soll z.B. 16x16px groß sein.
        const cm = parseFloat(textureScaleCm) || 40;
        const targetTilePx = (cm / 100) * PIXELS_PER_METER;
        const scaleFactor = targetTilePx / img.naturalWidth;

        if (pattern.setTransform && window.DOMMatrix) {
          const matrix = new DOMMatrix();
          matrix.translateSelf(x, y);
          matrix.scaleSelf(scaleFactor, scaleFactor);
          pattern.setTransform(matrix);
        }

        ctx.fillStyle = pattern;
        ctx.fillRect(x, y, width, height);
        ctx.restore();
        return;
      }
    }
  }

  if (surface === 'fliesen') {
    // Moderne helle Großformatfliesen mit Fugen
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    const tileSize = 28;
    for (let px = x; px <= x + width; px += tileSize) {
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + height); ctx.stroke();
    }
    for (let py = y; py <= y + height; py += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + width, py); ctx.stroke();
    }
  } else if (surface === 'laminat') {
    // Warmes Eiche-Laminat / Parkett mit Dielenmuster
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1;
    const plankH = 20;
    let row = 0;
    for (let py = y; py <= y + height; py += plankH) {
      ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + width, py); ctx.stroke();
      const offset = (row % 2) * 50;
      for (let px = x + offset; px <= x + width; px += 100) {
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + plankH); ctx.stroke();
      }
      row++;
    }
  } else if (surface === 'teppich') {
    // Weicher Textilteppich
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#94a3b8';
    for (let px = x + 4; px < x + width; px += 10) {
      for (let py = y + 4; py < y + height; py += 10) {
        ctx.fillRect(px, py, 2, 2);
      }
    }
  } else {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x, y, width, height);
  }
  ctx.restore();
}

// ----------------------------------------------------
// DETAILLIERTE 2D-MÖBELZEICHNUNGEN
// ----------------------------------------------------

// 1b. U-förmige Wohnlandschaft
function drawDesignerCouchU(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
  let baseFill = '#475569';
  if (el.textureImg) { const img = getCachedImage(el.textureImg); if (img) baseFill = ctx.createPattern(img, 'repeat'); }
  ctx.fillStyle = baseFill;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  const backDepth = 22;
  const chaiseW = Math.min(w * 0.28, 70);

  // Basis
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  // U-Ausschnitt in der vorderen Mitte
  ctx.clearRect(x + chaiseW, y + backDepth + 35, w - chaiseW * 2, h - backDepth - 35);

  // Konturen & Rückenlehne nachziehen
  ctx.fillRect(x, y, w, backDepth + 35);
  ctx.fillRect(x, y, chaiseW, h);
  ctx.fillRect(x + w - chaiseW, y, chaiseW, h);
  ctx.strokeRect(x, y, w, backDepth + 35);
  ctx.strokeRect(x, y, chaiseW, h);
  ctx.strokeRect(x + w - chaiseW, y, chaiseW, h);

  // Gepolsterte Rückenlehne
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + 2, y + 2, w - 4, backDepth);

  // Akzentkissen
  ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + chaiseW - 16, y + backDepth + 6, 16, 16);
  ctx.fillStyle = '#fbbf24'; ctx.fillRect(x + w - chaiseW, y + backDepth + 6, 16, 16);

  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🛋️ ' + el.label, x + w / 2, y + 42);
  ctx.restore();
}

// 1c. Sitzbank am Esstisch
function drawBench(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  // Holzlatten
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🪑 ' + el.label, x + w / 2, y + h / 2);
  ctx.restore();
}

// 1d. Kühlschrank (Side-by-Side)
function drawFridge(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  // Doppeltür-Spalt
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x + w * 0.45, y); ctx.lineTo(x + w * 0.45, y + h); ctx.stroke();
  // Griffe
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + w * 0.45 - 3, y + h * 0.25, 2, h * 0.5);
  ctx.fillRect(x + w * 0.45 + 2, y + h * 0.25, 2, h * 0.5);
  // Wasserspender Display links
  ctx.fillStyle = '#0284c7'; ctx.fillRect(x + 6, y + 8, 14, 18);
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('❄️ ' + el.label, x + w / 2, y + h - 8);
  ctx.restore();
}

// 1e. Ofen & Herdblock
function drawOvenHob(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  // 4 Kochzonen
  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
  const r = Math.min(w, h) * 0.18;
  ctx.beginPath(); ctx.arc(x + w * 0.3, y + h * 0.32, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.32, r * 0.8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + w * 0.3, y + h * 0.68, r * 0.8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.68, r * 1.1, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🔥 ' + el.label, x + w / 2, y + h / 2 + 3);
  ctx.restore();
}

// 1f. Küchenschrank / Unterschrank
function drawKitchenCabinet(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x + w / 2 - 8, y + 4, 6, 2);
  ctx.fillRect(x + w / 2 + 2, y + 4, 6, 2);
  ctx.fillStyle = '#334155'; ctx.font = '600 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🗄️ ' + el.label, x + w / 2, y + h / 2 + 4);
  ctx.restore();
}

// 1g. Spüle mit Unterschrank
function drawSinkCabinet(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  const basinW = w * 0.5; const basinH = h * 0.7;
  ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
  ctx.fillRect(x + 8, y + (h - basinH) / 2, basinW, basinH);
  ctx.strokeRect(x + 8, y + (h - basinH) / 2, basinW, basinH);
  ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(x + 8 + basinW / 2, y + (h - basinH) / 2 + 4, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  for (let rx = x + basinW + 16; rx < x + w - 8; rx += 8) {
    ctx.beginPath(); ctx.moveTo(rx, y + 10); ctx.lineTo(rx, y + h - 10); ctx.stroke();
  }
  ctx.fillStyle = '#1e293b'; ctx.font = '600 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🚰 ' + el.label, x + w / 2, y + h - 6);
  ctx.restore();
}

// 1h. Komfort-Doppelbett
function drawDoubleBed(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#d97706'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  const headH = 20;
  ctx.fillStyle = '#475569'; ctx.fillRect(x, y, w, headH);
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(x + 4, y + headH + 2, w - 8, h - headH - 6);
  const pillowW = (w - 20) / 2;
  const pillowH = 28;
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
  ctx.fillRect(x + 8, y + headH + 4, pillowW, pillowH);
  ctx.strokeRect(x + 8, y + headH + 4, pillowW, pillowH);
  ctx.fillRect(x + 12 + pillowW, y + headH + 4, pillowW, pillowH);
  ctx.strokeRect(x + 12 + pillowW, y + headH + 4, pillowW, pillowH);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(x + 4, y + headH + pillowH + 10, w - 8, h - headH - pillowH - 14);
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🛏️ ' + el.label, x + w / 2, y + h / 2 + 25);
  ctx.restore();
}

// 1i. Nachtschränkchen
function drawNightstand(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fef08a'; ctx.fill(); ctx.strokeStyle = '#ca8a04'; ctx.stroke();
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(el.label, x + w / 2, y + h - 4);
  ctx.restore();
}

// 1j. Großer Kleiderschrank
function drawWardrobe(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  const doors = Math.max(2, Math.round(w / 50));
  const doorW = w / doors;
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1;
  for (let i = 1; i < doors; i++) {
    ctx.beginPath(); ctx.moveTo(x + i * doorW, y); ctx.lineTo(x + i * doorW, y + h); ctx.stroke();
  }
  ctx.fillStyle = '#334155';
  for (let i = 0; i < doors; i++) {
    ctx.fillRect(x + i * doorW + doorW - 5, y + h / 2 - 6, 2, 12);
  }
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🚪 ' + el.label, x + w / 2, y + h / 2 + 4);
  ctx.restore();
}

// 1k. Bücherregal / Raumteiler
function drawBookshelf(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#78350f'; ctx.strokeStyle = '#451a03'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#7c3aed', '#db2777'];
  const cols = Math.floor((w - 8) / 8);
  for (let i = 0; i < cols; i++) {
    ctx.fillStyle = bookColors[i % bookColors.length];
    ctx.fillRect(x + 4 + i * 8, y + 3, 6, h - 6);
  }
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('📚 ' + el.label, x + w / 2, y + h / 2 + 3);
  ctx.restore();
}

// 1l. Schreibtisch mit Drehstuhl
function drawDesk(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#f5efe6'; ctx.strokeStyle = '#8c7355'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#334155'; ctx.fillRect(x + (w - 60) / 2, y + 8, 60, h - 16);
  ctx.beginPath(); ctx.arc(x + w / 2, y + h + 10, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b'; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🖥️ ' + el.label, x + w / 2, y + h / 2 + 4);
  ctx.restore();
}

// 1m. Computer & Monitor
function drawComputer(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(x + (w - 55) / 2, y + 6, 55, 8);
  ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + (w - 51) / 2, y + 8, 51, 4);
  ctx.fillStyle = '#475569'; ctx.fillRect(x + (w - 45) / 2, y + 22, 45, 14);
  ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.arc(x + (w - 45) / 2 + 52, y + 29, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('💻 ' + el.label, x + w / 2, y + h - 8);
  ctx.restore();
}

// 1n. Künstler-Staffelei
function drawEasel(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 4); ctx.lineTo(x + 6, y + h - 4);
  ctx.moveTo(x + w / 2, y + 4); ctx.lineTo(x + w - 6, y + h - 4);
  ctx.moveTo(x + w / 2, y + 4); ctx.lineTo(x + w / 2, y + h - 4);
  ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
  ctx.fillRect(x + (w - 36) / 2, y + 10, 36, 26);
  ctx.strokeRect(x + (w - 36) / 2, y + 10, 36, 26);
  ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.arc(x + w / 2 - 8, y + 23, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(x + w / 2 + 8, y + 23, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#78350f'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🎨 ' + el.label, x + w / 2, y + h - 2);
  ctx.restore();
}

// 1o. Badewanne
function drawBathtub(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x + 6, y + 6, w - 12, h - 12, Math.min(w, h) * 0.3) : ctx.rect(x + 6, y + 6, w - 12, h - 12);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.arc(x + 22, y + h / 2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0891b2'; ctx.fillRect(x + 8, y + h / 2 - 3, 6, 6);
  ctx.fillStyle = '#0e7490'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🛁 ' + el.label, x + w / 2, y + h / 2 + 4);
  ctx.restore();
}

// 1p. Handtuchheizung
function drawTowelRadiator(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 1.5;
  for (let px = x + 6; px < x + w - 6; px += 8) {
    ctx.beginPath(); ctx.moveTo(px, y + 2); ctx.lineTo(px, y + h - 2); ctx.stroke();
  }
  ctx.fillStyle = '#f43f5e'; ctx.fillRect(x + w * 0.3, y + 1, w * 0.4, h - 2);
  ctx.restore();
}

// 1q. Wandheizkörper
function drawRadiator(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
  for (let px = x + 4; px < x + w - 4; px += 5) {
    ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
  }
  ctx.fillStyle = '#ef4444'; ctx.fillRect(x + 2, y + h / 2 - 3, 4, 6);
  ctx.restore();
}

// 1r. Wandspiegel
function drawMirror(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#e0f2fe'; ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + 6, y + h - 2); ctx.lineTo(x + 18, y + 2); ctx.stroke();
  ctx.restore();
}

// 1s. Wandbild / Gemälde
function drawWallArt(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#d97706'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.restore();
}

// 1t. Sitzkissen / Pouf
function drawPouf(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#e0e7ff'; ctx.strokeStyle = '#4338ca'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, 14) : ctx.rect(x, y, w, h);
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#3730a3'; ctx.fill();
  ctx.fillStyle = '#3730a3'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🧘 ' + el.label, x + w / 2, y + h - 6);
  ctx.restore();
}

// 1u. Katzen-Kratzbaum
function drawCatTree(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#d97706';
  ctx.beginPath(); ctx.arc(x + 15, y + 15, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w - 15, y + 15, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 + 5, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#334155'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🐱 ' + el.label, x + w / 2, y + h / 2 + 8);
  ctx.restore();
}

// 1v. Runder Designer-Teppich
function drawRoundRug(ctx, el) {
  const { x, y, width: w, height: h } = el;
  const r = Math.min(w, h) / 2;
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  let fill = '#fed7aa';
  if (el.textureImg) {
    const img = getCachedImage(el.textureImg);
    if (img) fill = ctx.createPattern(img, 'repeat');
  }
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#9a3412'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('⭕ ' + el.label, cx, cy);
  ctx.restore();
}

// 2. Schöne Designer L-Eckcouch
function drawDesignerCouchL(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();

  // Schatten
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // Couch-Grundkörper
  let baseFill = '#475569';
  let cushionFill = '#64748b';
  if (el.textureImg) {
    const img = getCachedImage(el.textureImg);
    if (img) {
      baseFill = ctx.createPattern(img, 'repeat');
      cushionFill = baseFill;
    }
  }

  ctx.fillStyle = baseFill;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;

  // L-Form Pfad
  const chaiseW = w * 0.45;
  const backDepth = 22;

  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // Rückenlehne (L-förmig umlaufend)
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, y, w, backDepth);
  ctx.fillRect(x, y, backDepth, h);

  // Sitzpolster (gepolsterte Segmente)
  ctx.fillStyle = cushionFill;
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;

  // Chaiselongue Polster
  ctx.fillRect(x + backDepth + 4, y + backDepth + 4, chaiseW - backDepth - 8, h - backDepth - 8);
  ctx.strokeRect(x + backDepth + 4, y + backDepth + 4, chaiseW - backDepth - 8, h - backDepth - 8);

  // Rechte Sitzkissen (2 Kissen)
  const remainingW = w - chaiseW - 4;
  const cushionW = remainingW / 2;
  const cushionH = h * 0.65 - backDepth;

  ctx.fillRect(x + chaiseW + 2, y + backDepth + 4, cushionW - 4, cushionH);
  ctx.strokeRect(x + chaiseW + 2, y + backDepth + 4, cushionW - 4, cushionH);

  ctx.fillRect(x + chaiseW + cushionW, y + backDepth + 4, cushionW - 4, cushionH);
  ctx.strokeRect(x + chaiseW + cushionW, y + backDepth + 4, cushionW - 4, cushionH);

  // Dekorative Zierkissen
  ctx.fillStyle = '#38bdf8'; // Akzent Blau
  ctx.fillRect(x + backDepth + 8, y + backDepth + 8, 20, 20);
  ctx.fillStyle = '#fbbf24'; // Akzent Senfgelb
  ctx.fillRect(x + w - 30, y + backDepth + 8, 20, 20);

  // Label
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🛋️ ' + el.label, x + w / 2, y + h / 2 + 10);

  ctx.restore();
}

// 3. 3er Sofa
function drawSofa3(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();
  ctx.fillStyle = '#475569';
  ctx.fillRect(x, y, w, h);

  // Rückenlehne
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, y, w, 18);
  // Armlehnen
  ctx.fillRect(x, y, 16, h);
  ctx.fillRect(x + w - 16, y, 16, h);

  // 3 Sitzkissen
  const seatW = (w - 36) / 3;
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#334155';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 18 + i * seatW, y + 20, seatW - 2, h - 24);
    ctx.strokeRect(x + 18 + i * seatW, y + 20, seatW - 2, h - 24);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🛋️ ' + el.label, x + w / 2, y + h / 2 + 5);
  ctx.restore();
}

// 4. Eleganter Esstisch mit 6 Designer-Stühlen
function drawDiningTableWithChairs(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();

  // Stühle oben & unten (jeweils 3 Stühle)
  const chairW = 32;
  const chairH = 18;
  const chairSpacing = (w - 3 * chairW) / 4;

  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;

  // 3 Stühle oben
  for (let i = 0; i < 3; i++) {
    const cx = x + chairSpacing + i * (chairW + chairSpacing);
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cx, y - 8, chairW, chairH, 4) : ctx.rect(cx, y - 8, chairW, chairH);
    ctx.fill();
    ctx.stroke();
  }

  // 3 Stühle unten
  for (let i = 0; i < 3; i++) {
    const cx = x + chairSpacing + i * (chairW + chairSpacing);
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cx, y + h - 10, chairW, chairH, 4) : ctx.rect(cx, y + h - 10, chairW, chairH);
    ctx.fill();
    ctx.stroke();
  }

  // Tischplatte (Holzoptik mit Bevel oder Foto-Textur)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  let tableFill = '#d97706'; // Warmes Teak / Eiche
  if (el.textureImg) {
    const img = getCachedImage(el.textureImg);
    if (img) tableFill = ctx.createPattern(img, 'repeat');
  }

  ctx.fillStyle = tableFill;
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, 6) : ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // Tisch-Maserung / Dielen-Optik
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let py = y + 15; py < y + h; py += 18) {
    ctx.beginPath(); ctx.moveTo(x + 6, py); ctx.lineTo(x + w - 6, py); ctx.stroke();
  }

  // 6 Platzdeckchen
  ctx.fillStyle = '#fef3c7';
  for (let i = 0; i < 3; i++) {
    const cx = x + chairSpacing + i * (chairW + chairSpacing);
    ctx.fillRect(cx + 2, y + 4, chairW - 4, 14);
    ctx.fillRect(cx + 2, y + h - 18, chairW - 4, 14);
  }

  // Tischmitte Deko / Vase
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍽️ ' + el.label, x + w / 2, y + h / 2 + 18);

  ctx.restore();
}

// 5. Runder Tisch mit 4 Stühlen
function drawRoundTableWithChairs(ctx, el) {
  const { x, y, width: w } = el;
  const radius = w / 2;
  const centerX = x + radius;
  const centerY = y + radius;

  ctx.save();

  // 4 Stühle radial
  ctx.fillStyle = '#334155';
  const chairDist = radius + 8;
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
    const cx = centerX + Math.cos(angle) * chairDist;
    const cy = centerY + Math.sin(angle) * chairDist;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Runder Tisch
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#b45309';
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍽️ ' + el.label, centerX, centerY);

  ctx.restore();
}

// 6. Moderne Kücheninsel mit Kochfeld & Spüle
function drawKitchenIsland(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();

  // Insel-Korpus
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  // Induktionskochfeld links (Glaskeramik schwarz mit 4 Ringen)
  const hobW = w * 0.42;
  const hobH = h * 0.65;
  const hobX = x + 12;
  const hobY = y + (h - hobH) / 2;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(hobX, hobY, hobW, hobH);
  ctx.strokeStyle = '#ef4444'; // Rote Kochzonen
  ctx.lineWidth = 1.5;

  const r1 = hobH * 0.22;
  ctx.beginPath(); ctx.arc(hobX + hobW * 0.3, hobY + hobH * 0.32, r1, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(hobX + hobW * 0.72, hobY + hobH * 0.32, r1 * 0.8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(hobX + hobW * 0.3, hobY + hobH * 0.7, r1 * 0.8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(hobX + hobW * 0.72, hobY + hobH * 0.7, r1 * 1.1, 0, Math.PI * 2); ctx.stroke();

  // Edelstahl-Spülbecken rechts
  const sinkX = x + w * 0.58;
  const sinkY = y + (h - hobH) / 2;
  const sinkW = w * 0.35;

  ctx.fillStyle = '#cbd5e1';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.fillRect(sinkX, sinkY, sinkW, hobH);
  ctx.strokeRect(sinkX, sinkY, sinkW, hobH);

  // Wasserhahn
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(sinkX + sinkW / 2, sinkY + 6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍳 ' + el.label, x + w / 2, y + h - 6);

  ctx.restore();
}

// 7. Waschtisch & Modernes Waschbecken
function drawModernWaschtisch(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();

  // Waschtisch-Unterschrank
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#0891b2';
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  // Keramik-Waschbecken (oval)
  const basinW = w * 0.75;
  const basinH = h * 0.65;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2 + 2, basinW / 2, basinH / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Mischbatterie & Abfluss
  ctx.fillStyle = '#0891b2';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 - 8, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 + 3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#155e75';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚰 ' + el.label, x + w / 2, y + h - 3);

  ctx.restore();
}

// 8. Hänge-WC
function drawHangingToilet(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();

  // Unterputz-Spülkasten an der Wand
  ctx.fillStyle = '#0e7490';
  ctx.fillRect(x, y, w, 14);

  // Betätigungsplatte (Chrom)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(x + w / 2 - 10, y + 2, 20, 10);

  // WC-Keramik
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x + 4, y + 14, w - 8, h - 18, [0, 0, 16, 16]) : ctx.rect(x + 4, y + 14, w - 8, h - 18);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Toilettensitz-Deckel Innenlinie
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 14 + (h - 18) / 2, (w - 16) / 2, (h - 26) / 2, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#94a3b8';
  ctx.stroke();

  ctx.fillStyle = '#155e75';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚽 WC', x + w / 2, y + h - 5);

  ctx.restore();
}

// 9. Treppen (Aufwärts oder Abwärts mit Etagenverbindung und freier Steigungsrichtung)
function drawOpenStairs(ctx, el) {
  const { x, y, width: w, height: h } = el;
  const isUp = el.subType === 'treppe_auf' || el.stairDirection === 'up' || (!el.subType.includes('ab') && el.stairDirection !== 'down');
  const dir = el.stairRunDirection || 'east'; // 'east' (nach rechts), 'west' (nach links), 'north' (nach oben), 'south' (nach unten)
  ctx.save();

  // Treppenkörper
  ctx.fillStyle = isUp ? '#fef9c3' : '#f1f5f9';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = isUp ? '#ca8a04' : '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Stufen je nach Laufrichtung
  const steps = 8;
  const isVertical = (dir === 'north' || dir === 'south' || h > w * 1.3);

  if (isVertical) {
    const stepH = h / steps;
    for (let i = 0; i < steps; i++) {
      const sy = y + i * stepH;
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(x, sy, w, 4);
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, sy);
      ctx.lineTo(x + w, sy);
      ctx.stroke();
    }
  } else {
    const stepW = w / steps;
    for (let i = 0; i < steps; i++) {
      const sx = x + i * stepW;
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(sx, y, 4, h);
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.lineTo(sx, y + h);
      ctx.stroke();
    }
  }

  // Treppen-Geländer
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (isVertical) {
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + 4, y + h - 4);
  } else {
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + w - 4, y + 4);
  }
  ctx.stroke();

  // Steigungspfeil mit Startpunkt (Kreis) und Pfeilspitze in Richtung des Laufs
  const arrowColor = isUp ? '#ca8a04' : '#2563eb';
  ctx.strokeStyle = arrowColor;
  ctx.fillStyle = arrowColor;
  ctx.lineWidth = 2.5;

  let sx, sy, ex, ey;
  if (dir === 'west') {
    sx = x + w - 16; sy = y + h / 2; ex = x + 16; ey = y + h / 2;
  } else if (dir === 'north') {
    sx = x + w / 2; sy = y + h - 16; ex = x + w / 2; ey = y + 16;
  } else if (dir === 'south') {
    sx = x + w / 2; sy = y + 16; ex = x + w / 2; ey = y + h - 16;
  } else {
    // default 'east'
    sx = x + 16; sy = y + h / 2; ex = x + w - 16; ey = y + h / 2;
  }

  // Antritts-Kreis
  ctx.beginPath();
  ctx.arc(sx, sy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Pfeillinie
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Pfeilspitze
  const angle = Math.atan2(ey - sy, ex - sx);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 12 * Math.cos(angle - Math.PI / 6), ey - 12 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(ex - 12 * Math.cos(angle + Math.PI / 6), ey - 12 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  const targetText = el.targetFloor ? `nach ${el.targetFloor}` : '3 Etagen';
  ctx.fillStyle = '#854d0e';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${isUp ? '⬆ AUF' : '⬇ AB'} (${targetText})`, x + w / 2, y + h - 8);

  ctx.restore();
}

// 9b. Massive Wände & Trennwände
function drawWall(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();

  let wallFill = '#334155'; // Anthrazit Mauerwerk / Tapete
  if (el.textureImg) {
    const img = getCachedImage(el.textureImg);
    if (img) wallFill = ctx.createPattern(img, 'repeat');
  }

  ctx.fillStyle = wallFill;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;

  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  // Schraffur bei untexturierten breiteren Wänden
  if (!el.textureImg && w > 20 && h > 20) {
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    for (let py = y + 10; py < y + h; py += 12) {
      ctx.beginPath();
      ctx.moveTo(x + 2, py);
      ctx.lineTo(x + w - 2, py);
      ctx.stroke();
    }
  }

  // Kleines Label falls Platz
  if (w > 50 || h > 50) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧱 Wand', x + w / 2, y + h / 2);
  }

  ctx.restore();
}

// 9c. Türen mit frei wählbarem Schwenkbereich (nach innen / außen, DIN links / rechts)
function drawDoor(ctx, el) {
  const { x, y, width: w, height: h } = el;
  const swingIn = el.swingIn !== undefined ? el.swingIn : true; // true = nach innen, false = nach außen
  const hinge = el.hinge || 'left'; // 'left' | 'right'

  ctx.save();

  // Türrahmen / Zarge (weiß mit Rahmen)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Drehpunkt (Scharnier) berechnen
  const isVertical = h > w;
  const doorWidth = isVertical ? h : w;

  let hingeX, hingeY, startAngle, endAngle, leafEndX, leafEndY;

  if (!isVertical) {
    // Horizontale Tür (an Nord- oder Südwand)
    hingeX = (hinge === 'left') ? x : x + w;
    hingeY = y + h / 2;

    if (swingIn) {
      // Schwingt nach unten (in den Raum hinein bei Nordwand)
      if (hinge === 'left') {
        startAngle = 0; endAngle = Math.PI / 2;
        leafEndX = hingeX; leafEndY = hingeY + doorWidth;
      } else {
        startAngle = Math.PI / 2; endAngle = Math.PI;
        leafEndX = hingeX; leafEndY = hingeY + doorWidth;
      }
    } else {
      // Schwingt nach oben (nach außen)
      if (hinge === 'left') {
        startAngle = -Math.PI / 2; endAngle = 0;
        leafEndX = hingeX; leafEndY = hingeY - doorWidth;
      } else {
        startAngle = Math.PI; endAngle = Math.PI * 1.5;
        leafEndX = hingeX; leafEndY = hingeY - doorWidth;
      }
    }
  } else {
    // Vertikale Tür (an Ost- oder Westwand)
    hingeX = x + w / 2;
    hingeY = (hinge === 'left') ? y : y + h;

    if (swingIn) {
      // An Ostwand nach innen = nach links schwingen!
      startAngle = Math.PI / 2; endAngle = Math.PI;
      leafEndX = hingeX - doorWidth; leafEndY = hingeY;
    } else {
      // Nach rechts (nach außen) schwingen
      startAngle = 0; endAngle = Math.PI / 2;
      leafEndX = hingeX + doorWidth; leafEndY = hingeY;
    }
  }

  // 90°-Öffnungsbogen (gestrichelt)
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(hingeX, hingeY, doorWidth, startAngle, endAngle);
  ctx.stroke();
  ctx.setLineDash([]);

  // Türblatt (Holzbraun / Vollmaterial)
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hingeX, hingeY);
  ctx.lineTo(leafEndX, leafEndY);
  ctx.stroke();

  // Scharnierpunkt optisch hervorheben
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(hingeX, hingeY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Beschriftung
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 9px sans-serif';
  const labelText = `🚪 ${Math.round((doorWidth / PIXELS_PER_METER) * 100)}cm`;
  ctx.fillText(labelText, x + 4, y + Math.min(h, 14));

  ctx.restore();
}

// 10. Architektur-Fenster & Panoramafenster
function drawArchitecturalWindow(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();

  // Wandeinschnitt / Fensterbank
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y - 2, w, h + 4);

  // Äußerer Rahmen (Anthrazit)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Glasflächen (hellblau transparent)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

  // Doppel-Verglasung Linien
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  const midY = y + h / 2;
  ctx.beginPath();
  ctx.moveTo(x + 4, midY - 2);
  ctx.lineTo(x + w - 4, midY - 2);
  ctx.moveTo(x + 4, midY + 2);
  ctx.lineTo(x + w - 4, midY + 2);
  ctx.stroke();

  // Fenstersprossen / Flügelunterteilung
  const sashes = w > 160 ? 3 : 2;
  const sashW = w / sashes;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  for (let i = 1; i < sashes; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * sashW, y);
    ctx.lineTo(x + i * sashW, y + h);
    ctx.stroke();
  }

  // Label
  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🪟 ' + el.label, x + w / 2, y + h / 2 + 3);

  ctx.restore();
}

// 11. Detaillierte Pflanzen (Monstera, Ficus, Elefantenfuß & Drachenpalme)
function drawDetailedPlant(ctx, el) {
  const { x, y, radius: r, name, subType } = el;
  ctx.save();

  // Blumentopf-Untersetzer (verhindert Wasserflecken auf Laminat/Teppich)
  ctx.beginPath();
  ctx.arc(x, y, r + 4, 0, Math.PI * 2);
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  // Pflanzentopf (Terrakotta / Anthrazit)
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = '#b45309';
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();

  const isElefantenfuss = subType === 'pflanze_elefantenfuss' || name.toLowerCase().includes('elefantenfuß');
  const isDrachenpalme = subType === 'pflanze_drachenpalme' || name.toLowerCase().includes('drachenpalme');
  const isMonstera = subType === 'pflanze_gross' || name.toLowerCase().includes('monstera');

  if (isElefantenfuss) {
    // Dicker knolliger Fuß (Caudex) in der Mitte
    ctx.beginPath();
    ctx.arc(x, y, r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Zahlreiche feine, bogenförmig überhängende Schopblätter
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 20; i++) {
      const angle = (i * Math.PI * 2) / 20;
      const cpX = x + Math.cos(angle) * (r * 0.6);
      const cpY = y + Math.sin(angle) * (r * 0.6);
      const endX = x + Math.cos(angle + 0.3) * (r * 1.15);
      const endY = y + Math.sin(angle + 0.3) * (r * 1.15);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }

  } else if (isDrachenpalme) {
    // Mehrere kleine Stämme
    [-5, 4].forEach(offX => {
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(x + offX - 2, y - 6, 5, 12);
    });

    // Strahlenförmige spitze Palmwedel mit dunklen Kanten
    const leafCount = 16;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i * Math.PI * 2) / leafCount;
      const lx = x + Math.cos(angle) * (r * 0.95);
      const ly = y + Math.sin(angle) * (r * 0.95);
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(r * 0.35, 0);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fillStyle = (i % 2 === 0) ? '#15803d' : '#166534';
      ctx.fill();
      ctx.strokeStyle = '#991b1b'; // Roter Blattrand
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

  } else if (isMonstera) {
    // Große Monstera Blätter
    const leafCount = 7;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i * (Math.PI * 2) / leafCount) + 0.3;
      const lx = x + Math.cos(angle) * (r * 0.85);
      const ly = y + Math.sin(angle) * (r * 0.85);

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.45, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#22c55e';
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

  } else {
    // Ficus / Bäumchen mit dichter runder Blattkrone
    const leafCount = 12;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i * (Math.PI * 2) / leafCount);
      const dist = (i % 2 === 0) ? r * 0.75 : r * 0.55;
      const lx = x + Math.cos(angle) * dist;
      const ly = y + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(lx, ly, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#166534' : '#15803d';
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // Text Label
  ctx.fillStyle = '#14532d';
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🪴 ' + name, x, y + r + 15);

  ctx.restore();
}

// Haupt-Renderfunktion für 2D Canvas mit Zoom, Pan & klar lesbaren Bemaßungen
function renderCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(canvasZoom, canvasZoom);

  // Feines Konstruktions-Raster (40px = 1 Meter) passend zu Zoom & Pan
  ctx.save();
  ctx.strokeStyle = '#f1ece4';
  ctx.lineWidth = Math.max(0.5, 1 / canvasZoom);

  const startGridX = Math.floor((-panX / canvasZoom) / PIXELS_PER_METER) * PIXELS_PER_METER - PIXELS_PER_METER * 4;
  const endGridX = startGridX + Math.ceil(canvas.width / canvasZoom) + PIXELS_PER_METER * 8;
  const startGridY = Math.floor((-panY / canvasZoom) / PIXELS_PER_METER) * PIXELS_PER_METER - PIXELS_PER_METER * 4;
  const endGridY = startGridY + Math.ceil(canvas.height / canvasZoom) + PIXELS_PER_METER * 8;

  for (let x = startGridX; x <= endGridX; x += PIXELS_PER_METER) {
    ctx.beginPath(); ctx.moveTo(x, startGridY); ctx.lineTo(x, endGridY); ctx.stroke();
  }
  for (let y = startGridY; y <= endGridY; y += PIXELS_PER_METER) {
    ctx.beginPath(); ctx.moveTo(startGridX, y); ctx.lineTo(endGridX, y); ctx.stroke();
  }
  ctx.restore();

  const elements = appData.floors[currentFloor] || [];

  // 1. Zuerst Räume rendern (Hintergrund-Ebene mit massiven Wänden)
  elements.filter(el => el.type === 'room').forEach(room => {
    drawSurfacePattern(ctx, room.surface, room.x, room.y, room.width, room.height, room.textureImg, room.textureScaleCm || 50);

    // Massive Raum-Außenwände (Architektur-Mauerwerk mit 8px Stärke)
    const wallThick = 8;
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    // Oben
    ctx.fillRect(room.x - wallThick, room.y - wallThick, room.width + wallThick * 2, wallThick);
    ctx.strokeRect(room.x - wallThick, room.y - wallThick, room.width + wallThick * 2, wallThick);
    // Unten
    ctx.fillRect(room.x - wallThick, room.y + room.height, room.width + wallThick * 2, wallThick);
    ctx.strokeRect(room.x - wallThick, room.y + room.height, room.width + wallThick * 2, wallThick);
    // Links
    ctx.fillRect(room.x - wallThick, room.y, wallThick, room.height);
    ctx.strokeRect(room.x - wallThick, room.y, wallThick, room.height);
    // Rechts
    ctx.fillRect(room.x + room.width, room.y, wallThick, room.height);
    ctx.strokeRect(room.x + room.width, room.y, wallThick, room.height);

    const wM = (room.width / PIXELS_PER_METER).toFixed(1);
    const hM = (room.height / PIXELS_PER_METER).toFixed(1);

    // Raum-Beschriftung & m² in einer eleganten Plakette AUßERHALB des Raumes (Raum bleibt komplett frei für Möbel!)
    if (room.badgePos !== 'hidden') {
      const bRect = getRoomBadgeRect(room);
      ctx.save();
      ctx.font = 'bold 12.5px "Plus Jakarta Sans", sans-serif';
      const actualW = Math.max(ctx.measureText(bRect.titleText).width, ctx.measureText(bRect.subText).width) + 26;
      const bW = Math.max(bRect.width, actualW);
      const bH = bRect.height;
      const bx = bRect.x;
      const by = bRect.y;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = (selectedElement === room) ? '#8c7355' : '#cbd5e1';
      ctx.lineWidth = (selectedElement === room) ? 1.5 : 1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(bx, by, bW, bH, 6);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(bx, by, bW, bH);
        ctx.strokeRect(bx, by, bW, bH);
      }
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(bRect.titleText, bx + 12, by + 17);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(bRect.subText, bx + 12, by + 32);

      // Falls dieser Raum ausgewählt ist: dezentes Verschiebe-Symbol
      if (selectedElement === room) {
        ctx.fillStyle = '#8c7355';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('✥', bx + bW - 14, by + 16);
      }

      ctx.restore();
    }

    // Deutliche Maßangaben an den Wandkanten (Oben: Breite & Links: Länge)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;

    // Oben: Breite
    const wBadge = `${wM} m`;
    ctx.font = 'bold 11px sans-serif';
    const wBadgeW = ctx.measureText(wBadge).width + 16;
    
    // Prüfen ob die Raum-Plakette oberhalb liegt und mit dem Maß-Badge kollidieren könnte
    const bRect = getRoomBadgeRect(room);
    const badgeIsTop = (room.badgePos !== 'hidden' && bRect.y < room.y && (bRect.y + bRect.height) >= room.y - 25);
    
    let drawWidthBadge = true;
    let wBadgeX = room.x + (room.width - wBadgeW) / 2;
    if (badgeIsTop) {
      if (room.width < bRect.width + wBadgeW + 30) {
        drawWidthBadge = false;
      } else {
        wBadgeX = Math.max(room.x + bRect.width + 15, room.x + (room.width - wBadgeW) / 2);
      }
    }

    if (drawWidthBadge) {
      ctx.fillRect(wBadgeX, room.y - 20, wBadgeW, 16);
      ctx.strokeRect(wBadgeX, room.y - 20, wBadgeW, 16);
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(`⟵ ${wBadge} ⟶`, wBadgeX + wBadgeW / 2, room.y - 8);
    }

    // Links: Länge
    const hBadge = `${hM} m`;
    const hBadgeW = ctx.measureText(hBadge).width + 14;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(room.x - hBadgeW - 10, room.y + (room.height - 16) / 2, hBadgeW, 16);
    ctx.strokeRect(room.x - hBadgeW - 10, room.y + (room.height - 16) / 2, hBadgeW, 16);
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(hBadge, room.x - hBadgeW / 2 - 10, room.y + room.height / 2 + 4);

    ctx.restore();
  });

  // 2. Wände rendern (Massive Trennwände mit freier Drehung)
  elements.filter(el => el.type === 'wall').forEach(w => {
    ctx.save();
    const rot = (w.rotation || 0) * (Math.PI / 180);
    if (rot !== 0) {
      const cx = w.x + w.width / 2;
      const cy = w.y + w.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);
    }
    drawWall(ctx, w);
    ctx.restore();
  });

  // 3. Möbel & Raumelemente rendern (mit Berücksichtigung von Rotation)
  elements.filter(el => el.type === 'furniture').forEach(f => {
    ctx.save();
    const rot = (f.rotation || 0) * (Math.PI / 180);
    if (rot !== 0) {
      const cx = f.x + f.width / 2;
      const cy = f.y + f.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);
    }

    const sub = f.subType;
    if (sub === 'couch_u') {
      drawDesignerCouchU(ctx, f);
    } else if (sub === 'couch_eck') {
      drawDesignerCouchL(ctx, f);
    } else if (sub === 'couch_3er') {
      drawSofa3(ctx, f);
    } else if (sub === 'tisch_gross') {
      drawDiningTableWithChairs(ctx, f);
    } else if (sub === 'esstisch_bank') {
      drawBench(ctx, f);
    } else if (sub === 'tisch_rund') {
      drawRoundTableWithChairs(ctx, f);
    } else if (sub === 'kuecheninsel') {
      drawKitchenIsland(ctx, f);
    } else if (sub === 'kuechenzeile') {
      drawKitchenIsland(ctx, f);
    } else if (sub === 'kuehlschrank') {
      drawFridge(ctx, f);
    } else if (sub === 'ofen') {
      drawOvenHob(ctx, f);
    } else if (sub === 'kuechenschrank') {
      drawKitchenCabinet(ctx, f);
    } else if (sub === 'spuele_schrank') {
      drawSinkCabinet(ctx, f);
    } else if (sub === 'bett_doppel') {
      drawDoubleBed(ctx, f);
    } else if (sub === 'nachtschrank') {
      drawNightstand(ctx, f);
    } else if (sub === 'kleiderschrank') {
      drawWardrobe(ctx, f);
    } else if (sub === 'regal') {
      drawBookshelf(ctx, f);
    } else if (sub === 'schreibtisch') {
      drawDesk(ctx, f);
    } else if (sub === 'computer') {
      drawComputer(ctx, f);
    } else if (sub === 'staffelei') {
      drawEasel(ctx, f);
    } else if (sub === 'waschtisch') {
      drawModernWaschtisch(ctx, f);
    } else if (sub === 'badewanne') {
      drawBathtub(ctx, f);
    } else if (sub === 'wc_haenge') {
      drawHangingToilet(ctx, f);
    } else if (sub === 'handtuchheizung') {
      drawTowelRadiator(ctx, f);
    } else if (sub === 'heizkoerper') {
      drawRadiator(ctx, f);
    } else if (sub === 'spiegel') {
      drawMirror(ctx, f);
    } else if (sub === 'wandbild') {
      drawWallArt(ctx, f);
    } else if (sub === 'sitzkissen') {
      drawPouf(ctx, f);
    } else if (sub === 'kratzbaum') {
      drawCatTree(ctx, f);
    } else if (sub === 'teppich_rund') {
      drawRoundRug(ctx, f);
    } else if (sub === 'treppe' || sub === 'treppe_auf' || sub === 'treppe_ab') {
      drawOpenStairs(ctx, f);
    } else if (sub === 'tuer') {
      drawDoor(ctx, f);
    } else if (sub === 'fenster' || sub === 'fenster_gross') {
      drawArchitecturalWindow(ctx, f);
    } else if (sub === 'fliesen_zone') {
      drawSurfacePattern(ctx, 'fliesen', f.x, f.y, f.width, f.height, f.textureImg, f.textureScaleCm || 50);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(f.x, f.y, f.width, f.height);
      ctx.setLineDash([]);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('🍳 Fliesenbereich Küche', f.x + 10, f.y + 20);
    } else if (sub === 'teppich_insel') {
      drawSurfacePattern(ctx, 'teppich', f.x, f.y, f.width, f.height, f.textureImg, f.textureScaleCm || 80);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(f.x, f.y, f.width, f.height);
      ctx.setLineDash([]);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧶 ' + f.label, f.x + f.width / 2, f.y + f.height / 2);
    } else {
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.fillRect(f.x, f.y, f.width, f.height);
      ctx.strokeRect(f.x, f.y, f.width, f.height);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.label, f.x + f.width / 2, f.y + f.height / 2 + 4);
      ctx.restore();
    }
    ctx.restore();
  });

  // 4. Pflanzen rendern
  elements.filter(el => el.type === 'plant').forEach(p => {
    drawDetailedPlant(ctx, p);
  });

  // 5. Highlight & Umriss-Resize-Griffe für ausgewähltes Element
  if (selectedElement) {
    ctx.save();
    ctx.strokeStyle = '#8c7355';
    ctx.lineWidth = Math.max(2, 2.5 / canvasZoom);
    ctx.setLineDash([5, 3]);

    if (selectedElement.type === 'plant') {
      ctx.beginPath();
      ctx.arc(selectedElement.x, selectedElement.y, selectedElement.radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([]);
      const handles = getResizeHandles(selectedElement);
      const hSize = Math.max(9, Math.round(11 / canvasZoom));
      handles.forEach(h => {
        ctx.beginPath();
        ctx.arc(h.x, h.y, hSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#8c7355';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    } else {
      ctx.strokeRect(selectedElement.x - 3, selectedElement.y - 3, selectedElement.width + 6, selectedElement.height + 6);

      // Größere, gut greifbare Griffe zeichnen
      ctx.setLineDash([]);
      const handles = getResizeHandles(selectedElement);
      const hSize = Math.max(9, Math.round(11 / canvasZoom));
      handles.forEach(h => {
        ctx.fillStyle = '#8c7355';
        ctx.fillRect(h.x - hSize / 2, h.y - hSize / 2, hSize, hSize);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(h.x - hSize / 2, h.y - hSize / 2, hSize, hSize);
      });
    }
    ctx.restore();
  }

  ctx.restore(); // Ende der Zoom/Pan-Transformation
}

// ----------------------------------------------------
// ELEMENT-INSPEKTOR MIT VARIABLEN M² & UMRISS & TEXTUREN
// ----------------------------------------------------
function getTextureControlHTML(el) {
  const currentCm = el.textureScaleCm || 50;
  return `
    <div class="texture-control-box">
      <label style="font-size:0.78rem; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); font-weight:700;">
        📸 Foto-Oberfläche (Original-Material)
      </label>
      <div class="texture-swatch-preview">
        <div class="texture-swatch-img" style="background-image: ${el.textureImg ? `url(${el.textureImg})` : 'none'}; background-color: ${el.textureImg ? 'transparent' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center;">
          ${el.textureImg ? '' : '<span style="font-size:1.2rem;">📷</span>'}
        </div>
        <div style="flex:1; display:flex; flex-direction:column; gap:0.3rem;">
          <button id="btn-open-camera" class="btn btn-sm btn-primary">📷 Foto aufnehmen / hochladen</button>
          ${el.textureImg ? '<button id="btn-remove-texture" class="btn btn-sm btn-ghost" style="color:var(--danger); font-size:0.75rem; padding:2px;">✕ Foto entfernen</button>' : ''}
        </div>
      </div>

      ${el.textureImg ? `
        <div style="display:flex; flex-direction:column; gap:0.25rem; margin-top:0.35rem; background:#ffffff; padding:0.45rem; border-radius:6px; border:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:0.75rem; font-weight:700;">📏 Kachelgröße / Fliesenmaß:</label>
            <span id="label-texture-scale-cm" style="font-size:0.78rem; font-weight:700; color:var(--primary);">${currentCm} cm</span>
          </div>
          <input type="range" id="input-texture-scale-cm" min="15" max="150" step="5" value="${currentCm}">
          <div style="display:flex; justify-content:space-between; font-size:0.68rem; color:var(--text-muted);">
            <span>Klein (20 cm)</span>
            <span>Mittel (50 cm)</span>
            <span>Groß (100 cm)</span>
          </div>
        </div>
      ` : ''}

      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
        Oder Vorlage wählen:
        <div class="texture-sample-row">
          <span class="sample-chip" data-sample="eiche">🪵 Eichenholz</span>
          <span class="sample-chip" data-sample="marmor">🏛️ Marmor</span>
          <span class="sample-chip" data-sample="teppich">🧶 Berber-Wolle</span>
          <span class="sample-chip" data-sample="samt">🛋️ Polsterstoff</span>
          <span class="sample-chip" data-sample="beton">🧱 Putz/Beton</span>
          <span class="sample-chip" data-sample="tapete">📜 Tapete</span>
          <span class="sample-chip" data-sample="klinker">🧱 Klinker</span>
        </div>
      </div>
    </div>
  `;
}

function bindTextureControlEvents(el) {
  const btnCamera = document.getElementById('btn-open-camera');
  if (btnCamera) {
    btnCamera.addEventListener('click', () => {
      document.getElementById('camera-texture-input').click();
    });
  }

  const btnRemove = document.getElementById('btn-remove-texture');
  if (btnRemove) {
    btnRemove.addEventListener('click', () => {
      delete el.textureImg;
      delete el.textureScaleCm;
      saveData();
      updateInspector();
      renderCanvas();
      if (activeViewMode === '3d') update3DScene();
    });
  }

  const sliderCm = document.getElementById('input-texture-scale-cm');
  const labelCm = document.getElementById('label-texture-scale-cm');
  if (sliderCm) {
    sliderCm.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      el.textureScaleCm = val;
      if (labelCm) labelCm.textContent = val + ' cm';
      saveData();
      renderCanvas();
      if (activeViewMode === '3d') update3DScene();
    });
  }

  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleType = chip.dataset.sample;
      el.textureImg = getPresetSampleTexture(sampleType);
      el.textureScaleCm = sampleType === 'marmor' ? 60 : sampleType === 'eiche' ? 40 : sampleType === 'klinker' ? 30 : 50;
      saveData();
      updateInspector();
      renderCanvas();
      if (activeViewMode === '3d') update3DScene();
    });
  });
}

// ----------------------------------------------------
// FREIE DREHUNG (0° BIS 360°) FÜR MÖBEL, TÜREN, WÄNDE & TREPPEN
// ----------------------------------------------------
function getRotationControlHTML(el) {
  const rot = Math.round(el.rotation || 0);
  return `
    <div class="rotation-control-box" style="margin-top:0.5rem; background:var(--bg-main); border:1px solid var(--border); border-radius:8px; padding:0.55rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <label style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted);">
          🔄 Ausrichtung / Drehung
        </label>
        <span id="label-rotation-deg" style="font-size:0.8rem; font-weight:700; color:var(--primary);">${rot}°</span>
      </div>

      <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.3rem;">
        <input type="range" id="insp-rotation-slider" min="0" max="360" step="5" value="${rot}" style="flex:1;">
        <input type="number" id="insp-rotation-input" min="0" max="360" step="1" value="${rot}" style="width:55px; text-align:center; font-weight:700;">
      </div>

      <div style="display:flex; gap:0.25rem; margin-top:0.35rem; flex-wrap:wrap;">
        <button class="btn btn-sm btn-quick-rot" data-rot="0" style="flex:1; padding:2px 4px; font-size:0.72rem;">0° (Nord)</button>
        <button class="btn btn-sm btn-quick-rot" data-rot="90" style="flex:1; padding:2px 4px; font-size:0.72rem;">90° (Ost)</button>
        <button class="btn btn-sm btn-quick-rot" data-rot="180" style="flex:1; padding:2px 4px; font-size:0.72rem;">180° (Süd)</button>
        <button class="btn btn-sm btn-quick-rot" data-rot="270" style="flex:1; padding:2px 4px; font-size:0.72rem;">270° (West)</button>
      </div>

      <div style="display:flex; gap:0.3rem; margin-top:0.3rem;">
        <button id="btn-rot-minus-45" class="btn btn-sm btn-secondary" style="flex:1; font-size:0.75rem;">↺ -45°</button>
        <button id="btn-rot-plus-45" class="btn btn-sm btn-secondary" style="flex:1; font-size:0.75rem;">↻ +45°</button>
        <button id="btn-rot-plus-90" class="btn btn-sm btn-secondary" style="flex:1; font-size:0.75rem;">🔄 +90°</button>
      </div>
    </div>
  `;
}

function bindRotationControlEvents(el) {
  const slider = document.getElementById('insp-rotation-slider');
  const numInput = document.getElementById('insp-rotation-input');
  const label = document.getElementById('label-rotation-deg');

  const setRot = (deg) => {
    let normalized = Math.round(deg) % 360;
    if (normalized < 0) normalized += 360;
    el.rotation = normalized;
    if (slider) slider.value = normalized;
    if (numInput) numInput.value = normalized;
    if (label) label.textContent = normalized + '°';
    saveData();
    renderCanvas();
    if (activeViewMode === '3d') update3DScene();
  };

  if (slider) slider.addEventListener('input', (e) => setRot(parseFloat(e.target.value)));
  if (numInput) numInput.addEventListener('change', (e) => setRot(parseFloat(e.target.value)));

  document.querySelectorAll('.btn-quick-rot').forEach(btn => {
    btn.addEventListener('click', () => setRot(parseFloat(btn.dataset.rot)));
  });

  const btnM45 = document.getElementById('btn-rot-minus-45');
  if (btnM45) btnM45.addEventListener('click', () => setRot((el.rotation || 0) - 45));

  const btnP45 = document.getElementById('btn-rot-plus-45');
  if (btnP45) btnP45.addEventListener('click', () => setRot((el.rotation || 0) + 45));

  const btnP90 = document.getElementById('btn-rot-plus-90');
  if (btnP90) btnP90.addEventListener('click', () => setRot((el.rotation || 0) + 90));
}

function getScaleButtonsHTML() {
  return `
    <div style="display:flex; gap:0.4rem; margin-top:0.35rem;">
      <button id="btn-scale-down" class="btn btn-sm btn-secondary" style="flex:1;" title="Objekt um 10% verkleinern">➖ 10% kleiner</button>
      <button id="btn-scale-up" class="btn btn-sm btn-secondary" style="flex:1;" title="Objekt um 10% vergrößern">➕ 10% größer</button>
    </div>
  `;
}

function bindScaleButtons(el) {
  const btnDown = document.getElementById('btn-scale-down');
  const btnUp = document.getElementById('btn-scale-up');
  if (btnDown) {
    btnDown.addEventListener('click', () => {
      if (el.type === 'plant') {
        el.radius = Math.max(10, Math.round(el.radius * 0.9));
      } else {
        el.width = Math.max(14, Math.round(el.width * 0.9));
        el.height = Math.max(14, Math.round(el.height * 0.9));
        if (el.type === 'room') el.areaM2 = calculateAreaM2(el.width, el.height);
      }
      saveData();
      renderCanvas();
      updateInspector();
      if (activeViewMode === '3d') update3DScene();
    });
  }
  if (btnUp) {
    btnUp.addEventListener('click', () => {
      if (el.type === 'plant') {
        el.radius = Math.min(250, Math.round(el.radius * 1.1));
      } else {
        el.width = Math.round(el.width * 1.1);
        el.height = Math.round(el.height * 1.1);
        if (el.type === 'room') el.areaM2 = calculateAreaM2(el.width, el.height);
      }
      saveData();
      renderCanvas();
      updateInspector();
      if (activeViewMode === '3d') update3DScene();
    });
  }
}

function getPositionAndNudgeHTML(el, isWindowOrDoor = false) {
  return `
    <div class="position-control-box" style="margin-top:0.6rem;">
      <label style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted);">
        📍 Position & Feinjustierung
      </label>
      <div class="inspector-row">
        <div class="inspector-field">
          <label>Pos X (m)</label>
          <input type="number" id="insp-posX" step="0.1" value="${(el.x / PIXELS_PER_METER).toFixed(2)}">
        </div>
        <div class="inspector-field">
          <label>Pos Y (m)</label>
          <input type="number" id="insp-posY" step="0.1" value="${(el.y / PIXELS_PER_METER).toFixed(2)}">
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.25rem;">
        <span style="font-size:0.72rem; font-weight:700; color:var(--text-muted);">Schrittweite:</span>
        <div class="btn-group" id="nudge-step-group">
          <button class="btn btn-sm btn-nudge-step active" data-step="0.1">10 cm</button>
          <button class="btn btn-sm btn-nudge-step" data-step="0.5">50 cm</button>
        </div>
      </div>

      <div class="nudge-dpad" style="margin:0.35rem auto;">
        <div style="grid-column: 2;"><button class="nudge-btn" data-dx="0" data-dy="-1" title="Nach oben schieben">⬆️</button></div>
        <div style="grid-column: 1; grid-row: 2;"><button class="nudge-btn" data-dx="-1" data-dy="0" title="Nach links schieben">⬅️</button></div>
        <div style="grid-column: 2; grid-row: 2; font-size:0.75rem; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">✥</div>
        <div style="grid-column: 3; grid-row: 2;"><button class="nudge-btn" data-dx="1" data-dy="0" title="Nach rechts schieben">➡️</button></div>
        <div style="grid-column: 2; grid-row: 3;"><button class="nudge-btn" data-dx="0" data-dy="1" title="Nach unten schieben">⬇️</button></div>
      </div>

      ${isWindowOrDoor ? `
        <div style="margin-top:0.35rem; border-top:1px solid var(--border); padding-top:0.35rem;">
          <label style="font-size:0.74rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.25rem;">
            🪟 Schnell an Wand andocken:
          </label>
          <div class="dock-btn-grid">
            <button class="dock-btn" data-dock="north">⬆️ An Nordwand</button>
            <button class="dock-btn" data-dock="south">⬇️ An Südwand</button>
            <button class="dock-btn" data-dock="west">⬅️ An Westwand</button>
            <button class="dock-btn" data-dock="east">➡️ An Ostwand</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function bindPositionAndNudgeEvents(el) {
  const xInput = document.getElementById('insp-posX');
  const yInput = document.getElementById('insp-posY');

  if (xInput) {
    xInput.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        el.x = Math.round(val * PIXELS_PER_METER);
        saveData();
        renderCanvas();
        if (activeViewMode === '3d') update3DScene();
      }
    });
  }

  if (yInput) {
    yInput.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        el.y = Math.round(val * PIXELS_PER_METER);
        saveData();
        renderCanvas();
        if (activeViewMode === '3d') update3DScene();
      }
    });
  }

  let activeNudgeMeters = 0.1;
  document.querySelectorAll('.btn-nudge-step').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-nudge-step').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeNudgeMeters = parseFloat(btn.dataset.step) || 0.1;
    });
  });

  document.querySelectorAll('.nudge-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dx = parseInt(btn.dataset.dx, 10) * Math.round(activeNudgeMeters * PIXELS_PER_METER);
      const dy = parseInt(btn.dataset.dy, 10) * Math.round(activeNudgeMeters * PIXELS_PER_METER);
      el.x += dx;
      el.y += dy;
      if (xInput) xInput.value = (el.x / PIXELS_PER_METER).toFixed(2);
      if (yInput) yInput.value = (el.y / PIXELS_PER_METER).toFixed(2);
      saveData();
      renderCanvas();
      if (activeViewMode === '3d') update3DScene();
    });
  });

  document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dockDir = btn.dataset.dock;
      const rooms = (appData.floors[currentFloor] || []).filter(r => r.type === 'room');
      if (rooms.length === 0) {
        alert('Bitte ziehe zuerst einen Raum auf, an den das Fenster andocken kann.');
        return;
      }

      let targetRoom = rooms[0];
      let minDist = 999999;
      rooms.forEach(r => {
        const dist = Math.hypot((r.x + r.width / 2) - (el.x + el.width / 2), (r.y + r.height / 2) - (el.y + el.height / 2));
        if (dist < minDist) { minDist = dist; targetRoom = r; }
      });

      if (dockDir === 'north') {
        if (el.width < el.height) { const tmp = el.width; el.width = el.height; el.height = tmp; }
        el.x = Math.round(targetRoom.x + (targetRoom.width - el.width) / 2);
        el.y = Math.round(targetRoom.y - el.height / 2);
      } else if (dockDir === 'south') {
        if (el.width < el.height) { const tmp = el.width; el.width = el.height; el.height = tmp; }
        el.x = Math.round(targetRoom.x + (targetRoom.width - el.width) / 2);
        el.y = Math.round(targetRoom.y + targetRoom.height - el.height / 2);
      } else if (dockDir === 'west') {
        if (el.height < el.width) { const tmp = el.width; el.width = el.height; el.height = tmp; }
        el.x = Math.round(targetRoom.x - el.width / 2);
        el.y = Math.round(targetRoom.y + (targetRoom.height - el.height) / 2);
      } else if (dockDir === 'east') {
        if (el.height < el.width) { const tmp = el.width; el.width = el.height; el.height = tmp; }
        el.x = Math.round(targetRoom.x + targetRoom.width - el.width / 2);
        el.y = Math.round(targetRoom.y + (targetRoom.height - el.height) / 2);
      }

      if (xInput) xInput.value = (el.x / PIXELS_PER_METER).toFixed(2);
      if (yInput) yInput.value = (el.y / PIXELS_PER_METER).toFixed(2);

      const fwInput = document.getElementById('insp-fw');
      const fhInput = document.getElementById('insp-fh');
      if (fwInput) fwInput.value = (el.width / PIXELS_PER_METER).toFixed(2);
      if (fhInput) fhInput.value = (el.height / PIXELS_PER_METER).toFixed(2);

      saveData();
      renderCanvas();
      if (activeViewMode === '3d') update3DScene();
    });
  });
}

function updateInspector() {
  const panel = document.getElementById('inspector-content');
  if (!selectedElement) {
    panel.innerHTML = '<p class="muted-text">Klicke ein Zimmer, eine Treppe, ein Fenster oder ein Möbelstück auf dem Plan an, um Maße (m²), Umriss und Reinigungsdetails direkt anzupassen.</p>';
    return;
  }

  const el = selectedElement;

  if (el.type === 'room') {
    const wM = (el.width / PIXELS_PER_METER).toFixed(2);
    const hM = (el.height / PIXELS_PER_METER).toFixed(2);
    const m2 = el.areaM2 || calculateAreaM2(el.width, el.height);

    panel.innerHTML = `
      <div class="inspector-field">
        <label>Raumbezeichnung</label>
        <input type="text" id="insp-name" value="${el.name}">
      </div>

      <div class="inspector-field" style="margin-top:0.4rem;">
        <label>🏷️ Raum-Beschriftung auf Plan</label>
        <select id="insp-room-badge-pos" class="select-input">
          <option value="outside-top" ${(!el.badgePos || el.badgePos === 'outside-top') ? 'selected' : ''}>⬆️ Außerhalb oben (Standard – Raum frei)</option>
          <option value="outside-bottom" ${el.badgePos === 'outside-bottom' ? 'selected' : ''}>⬇️ Außerhalb unten</option>
          <option value="outside-left" ${el.badgePos === 'outside-left' ? 'selected' : ''}>⬅️ Außerhalb links</option>
          <option value="outside-right" ${el.badgePos === 'outside-right' ? 'selected' : ''}>➡️ Außerhalb rechts</option>
          <option value="inside" ${el.badgePos === 'inside' ? 'selected' : ''}>🔲 Innerhalb des Raumes (Ecke)</option>
          <option value="hidden" ${el.badgePos === 'hidden' ? 'selected' : ''}>🚫 Beschriftung ausblenden</option>
        </select>
        ${(el.badgeCustomX !== undefined && el.badgeCustomY !== undefined) ? `
          <button id="btn-reset-badge-pos" class="btn btn-sm btn-ghost" style="font-size:0.75rem; margin-top:0.3rem; padding:2px; color:var(--primary);">
            ↺ Position der Beschriftung zurücksetzen
          </button>
        ` : ''}
      </div>

      <div class="inspector-field">
        <label>Fläche (m² variabel)</label>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="number" id="insp-m2" step="0.5" min="1" max="500" value="${m2}" style="font-weight:700; font-size:1.05rem;">
          <span style="font-weight:600;">m²</span>
        </div>
      </div>

      <div class="inspector-row">
        <div class="inspector-field">
          <label>Breite (m)</label>
          <input type="number" id="insp-wm" step="0.1" min="0.5" value="${wM}">
        </div>
        <div class="inspector-field">
          <label>Länge (m)</label>
          <input type="number" id="insp-hm" step="0.1" min="0.5" value="${hM}">
        </div>
      </div>

      ${getScaleButtonsHTML()}
      ${getPositionAndNudgeHTML(el, false)}

      <div class="inspector-field" style="margin-top:0.6rem;">
        <label>Bodenbelag</label>
        <select id="insp-surface" class="select-input">
          <option value="laminat" ${el.surface === 'laminat' ? 'selected' : ''}>Laminat / Holz</option>
          <option value="fliesen" ${el.surface === 'fliesen' ? 'selected' : ''}>Fliesen</option>
          <option value="teppich" ${el.surface === 'teppich' ? 'selected' : ''}>Teppich</option>
        </select>
      </div>

      ${getTextureControlHTML(el)}

      <div class="tip-box" style="margin-top: 0.5rem; padding: 0.65rem;">
        <strong>Empfohlene Pflege:</strong>
        <p style="font-size:0.82rem; margin-top:0.3rem;">
          ${el.surface === 'laminat' ? 'Saugen oder nur nebelfeucht wischen. Vor stehendem Wasser schützen!' :
            el.surface === 'fliesen' ? 'Feucht wischen. Bei Bad/Küche Fett- bzw. Kalklöser einsetzen.' :
            'Tiefensaugen mit Bürstsauger. Flecken vorsichtig austupfen.'}
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem;">
        <button id="btn-insp-add-door" class="btn btn-sm btn-secondary">🚪 Zimmertür in Wand einsetzen</button>
        <button id="btn-insp-add-task" class="btn btn-sm btn-primary">➕ Putzaufgabe für diesen Raum verknüpfen</button>
        <button id="btn-insp-del" class="btn btn-sm btn-danger">🗑️ Raum löschen</button>
      </div>
    `;

    bindScaleButtons(el);
    bindPositionAndNudgeEvents(el);
    bindTextureControlEvents(el);

    const btnAddDoor = document.getElementById('btn-insp-add-door');
    if (btnAddDoor) {
      btnAddDoor.addEventListener('click', () => {
        const doorW = Math.min(70, Math.round(el.width * 0.35));
        const newDoor = {
          id: 'f-door-' + Date.now(),
          type: 'furniture',
          subType: 'tuer',
          label: 'Zimmertür',
          x: el.x + Math.round((el.width - doorW) / 2),
          y: el.y + el.height - 10,
          width: doorW,
          height: 20,
          swingIn: true,
          hinge: 'left'
        };
        if (!appData.floors[currentFloor]) appData.floors[currentFloor] = [];
        appData.floors[currentFloor].push(newDoor);
        selectedElement = newDoor;
        saveData();
        renderCanvas();
        updateInspector();
        if (activeViewMode === '3d') update3DScene();
      });
    }

    const badgePosSelect = document.getElementById('insp-room-badge-pos');
    if (badgePosSelect) {
      badgePosSelect.addEventListener('change', (e) => {
        el.badgePos = e.target.value;
        delete el.badgeCustomX;
        delete el.badgeCustomY;
        saveData();
        renderCanvas();
        updateInspector();
      });
    }

    const resetBadgeBtn = document.getElementById('btn-reset-badge-pos');
    if (resetBadgeBtn) {
      resetBadgeBtn.addEventListener('click', () => {
        delete el.badgeCustomX;
        delete el.badgeCustomY;
        el.badgePos = 'outside-top';
        saveData();
        renderCanvas();
        updateInspector();
      });
    }

    document.getElementById('insp-name').addEventListener('input', (e) => {
      el.name = e.target.value;
      saveData();
      renderCanvas();
    });

    document.getElementById('insp-surface').addEventListener('change', (e) => {
      el.surface = e.target.value;
      saveData();
      renderCanvas();
    });

    // Breite in Metern ändern
    document.getElementById('insp-wm').addEventListener('change', (e) => {
      const newW = parseFloat(e.target.value);
      if (newW > 0) {
        el.width = Math.round(newW * PIXELS_PER_METER);
        el.areaM2 = calculateAreaM2(el.width, el.height);
        document.getElementById('insp-m2').value = el.areaM2;
        saveData();
        renderCanvas();
      }
    });

    // Länge in Metern ändern
    document.getElementById('insp-hm').addEventListener('change', (e) => {
      const newH = parseFloat(e.target.value);
      if (newH > 0) {
        el.height = Math.round(newH * PIXELS_PER_METER);
        el.areaM2 = calculateAreaM2(el.width, el.height);
        document.getElementById('insp-m2').value = el.areaM2;
        saveData();
        renderCanvas();
      }
    });

    // m² direkt eingeben (skaliert Raum proportional)
    document.getElementById('insp-m2').addEventListener('change', (e) => {
      const targetM2 = parseFloat(e.target.value);
      if (targetM2 > 0) {
        const currentM2 = calculateAreaM2(el.width, el.height);
        const ratio = Math.sqrt(targetM2 / currentM2);
        el.width = Math.round(el.width * ratio);
        el.height = Math.round(el.height * ratio);
        el.areaM2 = targetM2;
        document.getElementById('insp-wm').value = (el.width / PIXELS_PER_METER).toFixed(2);
        document.getElementById('insp-hm').value = (el.height / PIXELS_PER_METER).toFixed(2);
        saveData();
        renderCanvas();
      }
    });

    document.getElementById('btn-insp-add-task').addEventListener('click', () => {
      const taskTitle = prompt(`Welche Aufgabe möchtest du für "${el.name}" anlegen?`, `Boden reinigen (${el.name})`);
      if (taskTitle) {
        appData.tasks.push({
          id: 't-' + Date.now(),
          title: taskTitle,
          floor: currentFloor,
          room: el.name,
          surface: el.surface === 'laminat' ? 'Laminat' : el.surface === 'fliesen' ? 'Fliesen' : 'Teppich',
          intervalDays: el.surface === 'fliesen' ? 4 : 5,
          lastDone: new Date().toISOString(),
          notes: `Bodenart: ${el.surface}`
        });
        saveData();
        renderTasks();
        alert('Aufgabe erfolgreich zum Putzplan hinzugefügt!');
      }
    });

    document.getElementById('btn-insp-del').addEventListener('click', () => {
      deleteSelectedElement();
    });

  } else if (el.type === 'wall') {
    const wM = (el.width / PIXELS_PER_METER).toFixed(2);
    const hM = (el.height / PIXELS_PER_METER).toFixed(2);

    panel.innerHTML = `
      <div class="inspector-field">
        <label>Wand-Bezeichnung</label>
        <input type="text" id="insp-wall-label" value="${el.label || 'Trennwand'}">
      </div>

      <div class="inspector-row">
        <div class="inspector-field">
          <label>Breite (m)</label>
          <input type="number" id="insp-ww" step="0.1" min="0.1" value="${wM}">
        </div>
        <div class="inspector-field">
          <label>Länge / Stärke (m)</label>
          <input type="number" id="insp-wh" step="0.1" min="0.1" value="${hM}">
        </div>
      </div>

      ${getScaleButtonsHTML()}
      ${getRotationControlHTML(el)}
      ${getPositionAndNudgeHTML(el, false)}
      ${getTextureControlHTML(el)}

      <div class="tip-box" style="margin-top:0.6rem; padding:0.6rem;">
        <strong>🧱 Wand-Info:</strong>
        <p style="font-size:0.82rem; margin-top:0.3rem;">Wände trennen Räume akustisch und optisch ab und können mit Fotos deiner realen Tapete oder Putzstruktur versehen werden.</p>
      </div>

      <div style="margin-top:1rem;">
        <button id="btn-insp-del" class="btn btn-sm btn-danger full-width">🗑️ Wand entfernen</button>
      </div>
    `;

    bindScaleButtons(el);
    bindRotationControlEvents(el);
    bindPositionAndNudgeEvents(el);
    bindTextureControlEvents(el);

    document.getElementById('insp-wall-label').addEventListener('input', (e) => {
      el.label = e.target.value;
      saveData();
      renderCanvas();
    });

    document.getElementById('insp-ww').addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (val > 0) {
        el.width = Math.round(val * PIXELS_PER_METER);
        saveData();
        renderCanvas();
      }
    });

    document.getElementById('insp-wh').addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (val > 0) {
        el.height = Math.round(val * PIXELS_PER_METER);
        saveData();
        renderCanvas();
      }
    });

    document.getElementById('btn-insp-rotate-wall').addEventListener('click', () => {
      const tmp = el.width;
      el.width = el.height;
      el.height = tmp;
      document.getElementById('insp-ww').value = (el.width / PIXELS_PER_METER).toFixed(2);
      document.getElementById('insp-wh').value = (el.height / PIXELS_PER_METER).toFixed(2);
      saveData();
      renderCanvas();
      if (activeViewMode === '3d') update3DScene();
    });

    document.getElementById('btn-insp-del').addEventListener('click', () => {
      deleteSelectedElement();
    });

  } else if (el.type === 'furniture') {
    const isWindow = el.subType === 'fenster' || el.subType === 'fenster_gross';
    const isDoor = el.subType === 'tuer';
    const isStairs = el.subType && el.subType.includes('treppe');
    const wM = (el.width / PIXELS_PER_METER).toFixed(2);
    const hM = (el.height / PIXELS_PER_METER).toFixed(2);

    panel.innerHTML = `
      <div class="inspector-field">
        <label>${isWindow ? 'Fenster-Bezeichnung' : isDoor ? 'Tür-Bezeichnung' : isStairs ? 'Treppen-Bezeichnung' : 'Möbelstück / Objekt'}</label>
        <input type="text" id="insp-label" value="${el.label}">
      </div>

      ${isStairs ? `
        <div class="inspector-field">
          <label>Führt zu Etage</label>
          <select id="insp-stairs-target" class="select-input">
            <option value="EG" ${el.targetFloor === 'EG' ? 'selected' : ''}>Erdgeschoss (EG)</option>
            <option value="1.OG" ${el.targetFloor === '1.OG' ? 'selected' : ''}>1. Obergeschoss</option>
            <option value="2.OG" ${el.targetFloor === '2.OG' ? 'selected' : ''}>2. OG / DG</option>
          </select>
        </div>
      ` : ''}

      <div class="inspector-row">
        <div class="inspector-field">
          <label>Breite (m)</label>
          <input type="number" id="insp-fw" step="0.1" min="0.2" value="${wM}">
        </div>
        <div class="inspector-field">
          <label>Tiefe (m)</label>
          <input type="number" id="insp-fh" step="0.1" min="0.2" value="${hM}">
        </div>
      </div>

      ${getScaleButtonsHTML()}

      ${isDoor ? `
        <div style="background:var(--bg-main); border:1px solid var(--border); border-radius:8px; padding:0.55rem; margin-top:0.4rem;">
          <label style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.25rem;">
            🚪 Tür-Öffnungsrichtung & Anschlag
          </label>
          <div style="display:flex; gap:0.4rem;">
            <button id="btn-toggle-door-swing" class="btn btn-sm btn-secondary" style="flex:1;">
              ${(el.swingIn !== false) ? '↩️ Nach innen öffnend' : '↪️ Nach außen öffnend'}
            </button>
            <button id="btn-toggle-door-hinge" class="btn btn-sm btn-secondary" style="flex:1;">
              ${(el.hinge === 'right') ? 'DIN Rechts' : 'DIN Links'}
            </button>
          </div>
        </div>
      ` : ''}

      ${isStairs ? `
        <div style="background:var(--bg-main); border:1px solid var(--border); border-radius:8px; padding:0.55rem; margin-top:0.4rem;">
          <label style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.25rem;">
            🪜 Treppen-Richtung & Steigung
          </label>
          <div style="display:flex; gap:0.35rem; margin-bottom:0.35rem;">
            <button id="btn-toggle-stair-mode" class="btn btn-sm btn-secondary" style="flex:1;">
              ${(el.subType === 'treppe_ab' || el.stairDirection === 'down') ? '⬇️ Abwärts' : '⬆️ Aufwärts'}
            </button>
          </div>
          <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted); margin-bottom:0.2rem;">Laufrichtung des Treppenlaufs:</div>
          <div style="display:flex; gap:0.2rem;">
            <button class="btn btn-sm btn-stair-dir ${(!el.stairRunDirection || el.stairRunDirection === 'east') ? 'active' : ''}" data-sdir="east" style="flex:1; padding:2px 4px; font-size:0.72rem;">➡️ Ost</button>
            <button class="btn btn-sm btn-stair-dir ${(el.stairRunDirection === 'west') ? 'active' : ''}" data-sdir="west" style="flex:1; padding:2px 4px; font-size:0.72rem;">⬅️ West</button>
            <button class="btn btn-sm btn-stair-dir ${(el.stairRunDirection === 'north') ? 'active' : ''}" data-sdir="north" style="flex:1; padding:2px 4px; font-size:0.72rem;">⬆️ Nord</button>
            <button class="btn btn-sm btn-stair-dir ${(el.stairRunDirection === 'south') ? 'active' : ''}" data-sdir="south" style="flex:1; padding:2px 4px; font-size:0.72rem;">⬇️ Süd</button>
          </div>
        </div>
      ` : ''}

      ${getRotationControlHTML(el)}

      ${getPositionAndNudgeHTML(el, isWindow || isDoor)}
      ${!isWindow && !isStairs ? getTextureControlHTML(el) : ''}

      ${isStairs ? `
        <div class="tip-box" style="margin-top:0.6rem; padding:0.6rem;">
          <strong>🪜 Treppenverbindung:</strong>
          <p style="font-size:0.82rem; margin-top:0.3rem;">Diese Treppe verbindet ${currentFloor} mit ${el.targetFloor || 'der nächsten Etage'}. In der 3D-Hausansicht führt sie kontinuierlich nach oben.</p>
        </div>
      ` : ''}

      ${isWindow ? `
        <div class="tip-box" style="margin-top:0.6rem; padding:0.6rem;">
          <strong>🪟 Fenster-Pflegetipp:</strong>
          <p style="font-size:0.82rem; margin-top:0.3rem;">Große Glasfronten alle 4-6 Wochen mit Fensterabzieher und Mikrofasertuch reinigen.</p>
        </div>
      ` : ''}

      <div style="margin-top:1rem;">
        <button id="btn-insp-del" class="btn btn-sm btn-danger full-width">🗑️ Objekt entfernen</button>
      </div>
    `;

    bindScaleButtons(el);
    bindRotationControlEvents(el);
    bindPositionAndNudgeEvents(el);
    if (!isWindow && !isStairs) {
      bindTextureControlEvents(el);
    }

    if (isDoor) {
      const btnSwing = document.getElementById('btn-toggle-door-swing');
      if (btnSwing) {
        btnSwing.addEventListener('click', () => {
          el.swingIn = !(el.swingIn !== false);
          saveData();
          renderCanvas();
          updateInspector();
        });
      }
      const btnHinge = document.getElementById('btn-toggle-door-hinge');
      if (btnHinge) {
        btnHinge.addEventListener('click', () => {
          el.hinge = (el.hinge === 'right') ? 'left' : 'right';
          saveData();
          renderCanvas();
          updateInspector();
        });
      }
    }

    if (isStairs) {
      const btnStairMode = document.getElementById('btn-toggle-stair-mode');
      if (btnStairMode) {
        btnStairMode.addEventListener('click', () => {
          const currentIsDown = (el.subType === 'treppe_ab' || el.stairDirection === 'down');
          el.stairDirection = currentIsDown ? 'up' : 'down';
          el.subType = currentIsDown ? 'treppe_auf' : 'treppe_ab';
          saveData();
          renderCanvas();
          updateInspector();
          if (activeViewMode === '3d') update3DScene();
        });
      }
      document.querySelectorAll('.btn-stair-dir').forEach(b => {
        b.addEventListener('click', () => {
          el.stairRunDirection = b.dataset.sdir;
          saveData();
          renderCanvas();
          updateInspector();
          if (activeViewMode === '3d') update3DScene();
        });
      });
    }

    document.getElementById('insp-label').addEventListener('input', (e) => {
      el.label = e.target.value;
      saveData();
      renderCanvas();
    });

    if (isStairs) {
      document.getElementById('insp-stairs-target').addEventListener('change', (e) => {
        el.targetFloor = e.target.value;
        saveData();
        renderCanvas();
      });
    }

    document.getElementById('insp-fw').addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (val > 0) {
        el.width = Math.round(val * PIXELS_PER_METER);
        saveData();
        renderCanvas();
        if (activeViewMode === '3d') update3DScene();
      }
    });

    document.getElementById('insp-fh').addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (val > 0) {
        el.height = Math.round(val * PIXELS_PER_METER);
        saveData();
        renderCanvas();
        if (activeViewMode === '3d') update3DScene();
      }
    });

    const rotBtn = document.getElementById('btn-insp-rotate');
    if (rotBtn) {
      rotBtn.addEventListener('click', () => {
        const tmp = el.width;
        el.width = el.height;
        el.height = tmp;
        document.getElementById('insp-fw').value = (el.width / PIXELS_PER_METER).toFixed(2);
        document.getElementById('insp-fh').value = (el.height / PIXELS_PER_METER).toFixed(2);
        saveData();
        renderCanvas();
        if (activeViewMode === '3d') update3DScene();
      });
    }

    const rotWallBtn = document.getElementById('btn-insp-rotate-wall');
    if (rotWallBtn) {
      rotWallBtn.addEventListener('click', () => {
        const tmp = el.width;
        el.width = el.height;
        el.height = tmp;
        const ww = document.getElementById('insp-ww');
        const wh = document.getElementById('insp-wh');
        if (ww) ww.value = (el.width / PIXELS_PER_METER).toFixed(2);
        if (wh) wh.value = (el.height / PIXELS_PER_METER).toFixed(2);
        saveData();
        renderCanvas();
        if (activeViewMode === '3d') update3DScene();
      });
    }

    document.getElementById('btn-insp-del').addEventListener('click', () => {
      deleteSelectedElement();
    });

  } else if (el.type === 'plant') {
    panel.innerHTML = `
      <div class="inspector-field">
        <label>Pflanzenname</label>
        <input type="text" id="insp-plant-name" value="${el.name}">
      </div>
      <div class="inspector-field">
        <label>Größe / Kronendurchmesser (cm)</label>
        <input type="number" id="insp-plant-r" min="15" max="150" value="${Math.round(el.radius * 2.5)}">
      </div>

      ${getScaleButtonsHTML()}
      ${getPositionAndNudgeHTML(el, false)}

      <div class="tip-box" style="margin-top: 0.6rem; padding: 0.6rem;">
        <strong>Tipp für Großpflanzen:</strong>
        <p style="font-size:0.82rem; margin-top:0.3rem;">Auf Teppich & Laminat stets Untersetzer mit Pflanzrollen verwenden!</p>
      </div>
      <div style="margin-top:1rem;">
        <button id="btn-insp-del" class="btn btn-sm btn-danger full-width">🗑️ Pflanze entfernen</button>
      </div>
    `;

    bindScaleButtons(el);
    bindPositionAndNudgeEvents(el);

    document.getElementById('insp-plant-name').addEventListener('input', (e) => {
      el.name = e.target.value;
      saveData();
      renderCanvas();
    });

    document.getElementById('insp-plant-r').addEventListener('change', (e) => {
      const cm = parseInt(e.target.value, 10);
      if (cm > 10) {
        el.radius = Math.round(cm / 2.5);
        saveData();
        renderCanvas();
        if (activeViewMode === '3d') update3DScene();
      }
    });

    document.getElementById('btn-insp-del').addEventListener('click', () => {
      deleteSelectedElement();
    });
  }
}

function deleteSelectedElement() {
  if (!selectedElement) return;
  const elements = appData.floors[currentFloor] || [];
  appData.floors[currentFloor] = elements.filter(item => item !== selectedElement);
  selectedElement = null;
  saveData();
  updateInspector();
  renderCanvas();
}

// ----------------------------------------------------
// 3. INTERAKTIVE 3D-HAUSANSICHT (Three.js)
// ----------------------------------------------------
let scene3D, camera3D, renderer3D, controls3D, isThreeInitialized = false;
let show3DRoof = true; // Dach ein- oder ausschalten

function initThree3D() {
  const container = document.getElementById('three-container');
  if (!container || typeof THREE === 'undefined') return;

  if (isThreeInitialized) {
    onWindowResize3D();
    return;
  }

  const w = container.clientWidth || 800;
  const h = container.clientHeight || 650;

  scene3D = new THREE.Scene();
  scene3D.background = new THREE.Color(0xf1f5f9);

  camera3D = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  camera3D.position.set(0, 35, 45);

  renderer3D = new THREE.WebGLRenderer({ antialias: true });
  renderer3D.setSize(w, h);
  renderer3D.shadowMap.enabled = true;
  renderer3D.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer3D.domElement);

  if (typeof THREE.OrbitControls !== 'undefined') {
    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.enableDamping = true;
    controls3D.dampingFactor = 0.05;
    controls3D.maxPolarAngle = Math.PI / 2.05; // Nicht unter den Boden blicken
  }

  // Beleuchtung
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene3D.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 0.85);
  sunLight.position.set(25, 40, 20);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene3D.add(sunLight);

  // Kameraperspektiven-Buttons
  document.getElementById('btn-3d-cam-top').addEventListener('click', () => {
    const targetY = currentFloor === 'ALL' ? 3.5 : 1.2;
    camera3D.position.set(0, currentFloor === 'ALL' ? 55 : 45, 0.1);
    controls3D.target.set(0, targetY, 0);
    controls3D.update();
  });

  document.getElementById('btn-3d-cam-iso').addEventListener('click', () => {
    const targetY = currentFloor === 'ALL' ? 3.5 : 1.2;
    camera3D.position.set(34, 30, 42);
    controls3D.target.set(0, targetY, 0);
    controls3D.update();
  });

  const btnFront = document.getElementById('btn-3d-cam-front');
  if (btnFront) {
    btnFront.addEventListener('click', () => {
      const targetY = currentFloor === 'ALL' ? 3.5 : 1.2;
      camera3D.position.set(0, currentFloor === 'ALL' ? 14 : 6, 52);
      controls3D.target.set(0, targetY, 0);
      controls3D.update();
    });
  }

  // Dach ein/ausblenden Button
  const btnToggleRoof = document.getElementById('btn-3d-toggle-roof');
  if (btnToggleRoof) {
    btnToggleRoof.addEventListener('click', () => {
      show3DRoof = !show3DRoof;
      btnToggleRoof.textContent = show3DRoof ? '🏠 Dach: An' : '🏠 Dach: Aus';
      btnToggleRoof.classList.toggle('btn-secondary', show3DRoof);
      btnToggleRoof.classList.toggle('btn-ghost', !show3DRoof);
      update3DScene();
    });
  }

  window.addEventListener('resize', onWindowResize3D);

  isThreeInitialized = true;
  animate3D();
}

function onWindowResize3D() {
  const container = document.getElementById('three-container');
  if (!container || !renderer3D || !camera3D) return;
  const w = container.clientWidth;
  const h = container.clientHeight || 650;
  camera3D.aspect = w / h;
  camera3D.updateProjectionMatrix();
  renderer3D.setSize(w, h);
}

function animate3D() {
  requestAnimationFrame(animate3D);
  if (controls3D) controls3D.update();
  if (renderer3D && scene3D && camera3D) {
    renderer3D.render(scene3D, camera3D);
  }
}

// 3D Szene aus den Daten der aktuellen Etage oder des gesamten Hauses (ALL) aufbauen
function update3DScene() {
  if (!scene3D || !isThreeInitialized) return;

  // Bestehende Objekte entfernen (außer Lichter)
  const toRemove = [];
  scene3D.children.forEach(child => {
    if (child.isMesh || child.isGroup) {
      toRemove.push(child);
    }
  });
  toRemove.forEach(child => scene3D.remove(child));

  const SCALE_3D = 0.05; // Umrechnung Canvas-Pixel in 3D-Einheiten

  // Etagen definieren
  const floorLevels = currentFloor === 'ALL'
    ? [
        { floorKey: 'EG', yOffset: 0, label: 'EG' },
        { floorKey: '1.OG', yOffset: 3.2, label: '1. OG' },
        { floorKey: '2.OG', yOffset: 6.4, label: '2. OG / DG' }
      ]
    : [
        { floorKey: currentFloor, yOffset: 0, label: currentFloor }
      ];

  // Mittelpunkt aller Etagen zur Zentrierung berechnen
  let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
  const allFloorsToCheck = currentFloor === 'ALL' ? ['EG', '1.OG', '2.OG'] : [currentFloor];
  allFloorsToCheck.forEach(fKey => {
    (appData.floors[fKey] || []).forEach(el => {
      minX = Math.min(minX, el.x);
      maxX = Math.max(maxX, el.x + (el.width || el.radius * 2));
      minY = Math.min(minY, el.y);
      maxY = Math.max(maxY, el.y + (el.height || el.radius * 2));
    });
  });

  if (minX === 9999) { minX = 60; maxX = 940; minY = 70; maxY = 550; }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const houseW = (maxX - minX) * SCALE_3D;
  const houseD = (maxY - minY) * SCALE_3D;

  // 1. Schöner grüner Rasen & Terrasse als Fundament (das Haus schwebt nicht mehr im Nichts!)
  const groundGeo = new THREE.BoxGeometry(houseW + 18, 0.25, houseD + 18);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.9 });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.set(0, -0.15, 0);
  groundMesh.receiveShadow = true;
  scene3D.add(groundMesh);

  // Steinterrasse direkt unter dem Erdgeschoss
  const terraceGeo = new THREE.BoxGeometry(houseW + 4, 0.2, houseD + 4);
  const terraceMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
  const terraceMesh = new THREE.Mesh(terraceGeo, terraceMat);
  terraceMesh.position.set(0, -0.04, 0);
  terraceMesh.receiveShadow = true;
  scene3D.add(terraceMesh);

  // Optimale Kamerapositionierung für architektonischen Überblick
  if (currentFloor === 'ALL') {
    camera3D.position.set(34, 32, 42);
    if (controls3D) {
      controls3D.target.set(0, 3.5, 0);
      controls3D.update();
    }
  } else {
    camera3D.position.set(24, 25, 32);
    if (controls3D) {
      controls3D.target.set(0, 1.2, 0);
      controls3D.update();
    }
  }

  // Für jede Etage die 3D Geometrien erzeugen
  floorLevels.forEach(lvl => {
    const elements = appData.floors[lvl.floorKey] || [];
    const baseY = lvl.yOffset;

    // 1. Räume als 3D-Böden & Wände extrudieren
    elements.filter(el => el.type === 'room').forEach(room => {
      const w = room.width * SCALE_3D;
      const d = room.height * SCALE_3D;
      const posX = (room.x + room.width / 2 - centerX) * SCALE_3D;
      const posZ = (room.y + room.height / 2 - centerY) * SCALE_3D;

      let floorMat;
      if (room.textureImg) {
        const tex = new THREE.TextureLoader().load(room.textureImg);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        // Reale Kachelgröße in 3D:
        // SCALE_3D = 0.05, 40px = 1m => 1 Einheit in 3D = 0.5m = 50cm
        const cm = parseFloat(room.textureScaleCm) || 50;
        const tileIn3DUnits = (cm / 100) / 0.5; // z.B. 50cm = 1.0 3D-Einheit, 30cm = 0.6 Einheiten
        const repeatX = Math.max(1, w / Math.max(0.2, tileIn3DUnits));
        const repeatZ = Math.max(1, d / Math.max(0.2, tileIn3DUnits));
        tex.repeat.set(repeatX, repeatZ);
        floorMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
      } else {
        let floorColor = 0xfef3c7; // Laminat
        let roughness = 0.4;
        if (room.surface === 'fliesen') {
          floorColor = 0xf1f5f9;
          roughness = 0.2;
        } else if (room.surface === 'teppich') {
          floorColor = 0xcbd5e1;
          roughness = 0.9;
        }
        floorMat = new THREE.MeshStandardMaterial({ color: floorColor, roughness });
      }

      const floorGeo = new THREE.BoxGeometry(w, 0.16, d);
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(posX, baseY + 0.08, posZ);
      floorMesh.receiveShadow = true;
      scene3D.add(floorMesh);

      // Raum-Außenwände (halbe Höhe im ALL-Modus für Puppenhaus-Einsicht, sonst 2.6m)
      const wallHeight = currentFloor === 'ALL' ? 1.6 : 2.6;
      const wallThick = 0.18;
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.8
      });

      const hWallGeo = new THREE.BoxGeometry(w, wallHeight, wallThick);
      const wallN = new THREE.Mesh(hWallGeo, wallMat);
      wallN.position.set(posX, baseY + wallHeight / 2, posZ - d / 2);
      wallN.castShadow = true;
      scene3D.add(wallN);

      const wallS = new THREE.Mesh(hWallGeo, wallMat);
      wallS.position.set(posX, baseY + wallHeight / 2, posZ + d / 2);
      wallS.castShadow = true;
      scene3D.add(wallS);

      const vWallGeo = new THREE.BoxGeometry(wallThick, wallHeight, d);
      const wallW = new THREE.Mesh(vWallGeo, wallMat);
      wallW.position.set(posX - w / 2, baseY + wallHeight / 2, posZ);
      wallW.castShadow = true;
      scene3D.add(wallW);

      const wallE = new THREE.Mesh(vWallGeo, wallMat);
      wallE.position.set(posX + w / 2, baseY + wallHeight / 2, posZ);
      wallE.castShadow = true;
      scene3D.add(wallE);
    });

    // 2. Massive Innen- & Trennwände
    elements.filter(el => el.type === 'wall').forEach(wall => {
      const w = wall.width * SCALE_3D;
      const d = wall.height * SCALE_3D;
      const posX = (wall.x + wall.width / 2 - centerX) * SCALE_3D;
      const posZ = (wall.y + wall.height / 2 - centerY) * SCALE_3D;
      const wallHeight = currentFloor === 'ALL' ? 1.6 : 2.6;

      let wallMat;
      if (wall.textureImg) {
        const tex = new THREE.TextureLoader().load(wall.textureImg);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(Math.max(1, w / 1.5), Math.max(1, wallHeight / 1.5));
        wallMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
      } else {
        wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
      }

      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(w, wallHeight, d), wallMat);
      wallMesh.position.set(posX, baseY + wallHeight / 2, posZ);
      if (wall.rotation) {
        wallMesh.rotation.y = -wall.rotation * (Math.PI / 180);
      }
      wallMesh.castShadow = true;
      scene3D.add(wallMesh);
    });

    // 3. Möbel & Einbauten in 3D
    elements.filter(el => el.type === 'furniture').forEach(f => {
      const w = f.width * SCALE_3D;
      const d = f.height * SCALE_3D;
      const posX = (f.x + f.width / 2 - centerX) * SCALE_3D;
      const posZ = (f.y + f.height / 2 - centerY) * SCALE_3D;

      const group = new THREE.Group();
      group.position.set(posX, baseY, posZ);
      if (f.rotation) {
        group.rotation.y = -f.rotation * (Math.PI / 180);
      }

      const sub = f.subType;

      if (sub === 'couch_eck' || sub === 'couch_3er' || sub === 'couch_u') {
        const seatH = 0.55;
        let seatMat, cushionMat;
        if (f.textureImg) {
          const tex = new THREE.TextureLoader().load(f.textureImg);
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(Math.max(1, w / 1.2), Math.max(1, d / 1.2));
          seatMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
          cushionMat = seatMat;
        } else {
          seatMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
          cushionMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
        }

        const base = new THREE.Mesh(new THREE.BoxGeometry(w, seatH, d), seatMat);
        base.position.y = seatH / 2;
        group.add(base);

        const backH = 0.45;
        const back = new THREE.Mesh(new THREE.BoxGeometry(w, backH, d * 0.25), cushionMat);
        back.position.set(0, seatH + backH / 2, -d * 0.35);
        group.add(back);

        if (sub === 'couch_u') {
          // 2 Chaiselongues links und rechts
          const wingW = w * 0.28;
          const leftArm = new THREE.Mesh(new THREE.BoxGeometry(wingW, backH * 0.8, d * 0.75), cushionMat);
          leftArm.position.set(-w / 2 + wingW / 2, seatH + backH * 0.4, 0);
          group.add(leftArm);
          const rightArm = new THREE.Mesh(new THREE.BoxGeometry(wingW, backH * 0.8, d * 0.75), cushionMat);
          rightArm.position.set(w / 2 - wingW / 2, seatH + backH * 0.4, 0);
          group.add(rightArm);
        }

      } else if (sub === 'bett_doppel') {
        const bedFrameH = 0.45;
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });
        const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
        const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });

        const frame = new THREE.Mesh(new THREE.BoxGeometry(w, bedFrameH, d), frameMat);
        frame.position.y = bedFrameH / 2;
        group.add(frame);

        // Kopfteil
        const headH = 0.65;
        const head = new THREE.Mesh(new THREE.BoxGeometry(w, headH, 0.1), frameMat);
        head.position.set(0, bedFrameH + headH / 2, -d / 2 + 0.05);
        group.add(head);

        // Matratze
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(w * 0.95, 0.25, d * 0.92), mattressMat);
        mattress.position.set(0, bedFrameH + 0.125, 0.04);
        group.add(mattress);

        // 2 Kissen
        [-w * 0.25, w * 0.25].forEach(px => {
          const pillow = new THREE.Mesh(new THREE.BoxGeometry(w * 0.35, 0.1, 0.35), pillowMat);
          pillow.position.set(px, bedFrameH + 0.28, -d * 0.3);
          group.add(pillow);
        });

      } else if (sub === 'kuehlschrank') {
        const fridgeH = 1.85;
        const fridgeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.4 });
        const fridge = new THREE.Mesh(new THREE.BoxGeometry(w, fridgeH, d), fridgeMat);
        fridge.position.y = fridgeH / 2;
        group.add(fridge);

      } else if (sub === 'kleiderschrank') {
        const wardH = 2.1;
        const wardMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
        const ward = new THREE.Mesh(new THREE.BoxGeometry(w, wardH, d), wardMat);
        ward.position.y = wardH / 2;
        group.add(ward);

      } else if (sub === 'regal') {
        const shelfH = 1.8;
        const shelfMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(w, shelfH, d), shelfMat);
        shelf.position.y = shelfH / 2;
        group.add(shelf);

      } else if (sub === 'badewanne') {
        const tubH = 0.65;
        const tubMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
        const tub = new THREE.Mesh(new THREE.BoxGeometry(w, tubH, d), tubMat);
        tub.position.y = tubH / 2;
        group.add(tub);

      } else if (sub === 'schreibtisch' || sub === 'computer') {
        const deskH = 0.75;
        const deskMat = new THREE.MeshStandardMaterial({ color: 0xf5efe6, roughness: 0.4 });
        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), deskMat);
        top.position.y = deskH;
        group.add(top);

        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
        const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, deskH, d * 0.9), legMat);
        leg1.position.set(-w / 2 + 0.08, deskH / 2, 0);
        group.add(leg1);
        const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, deskH, d * 0.9), legMat);
        leg2.position.set(w / 2 - 0.08, deskH / 2, 0);
        group.add(leg2);

        if (sub === 'computer') {
          const monMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
          const monitor = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.4, 0.05), monMat);
          monitor.position.set(0, deskH + 0.25, -d * 0.2);
          group.add(monitor);
        }

      } else if (sub === 'esstisch_bank') {
        const benchH = 0.48;
        const benchMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 });
        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), benchMat);
        top.position.y = benchH;
        group.add(top);

      } else if (sub === 'sitzkissen') {
        const poufH = 0.35;
        const poufMat = new THREE.MeshStandardMaterial({ color: 0x4338ca, roughness: 0.9 });
        const pouf = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, poufH, 16), poufMat);
        pouf.position.y = poufH / 2;
        group.add(pouf);

      } else if (sub === 'ofen' || sub === 'kuechenschrank' || sub === 'spuele_schrank') {
        const unitH = 0.9;
        const unitMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
        const unit = new THREE.Mesh(new THREE.BoxGeometry(w, unitH, d), unitMat);
        unit.position.y = unitH / 2;
        group.add(unit);

      } else if (sub === 'tisch_gross' || sub === 'tisch_rund') {
        const tableH = 0.85;
        let topMat;
        if (f.textureImg) {
          const tex = new THREE.TextureLoader().load(f.textureImg);
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(Math.max(1, w / 1.2), Math.max(1, d / 1.2));
          topMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
        } else {
          topMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
        }
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), topMat);
        top.position.y = tableH;
        group.add(top);

        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, tableH, 8);
        const legX = w / 2 - 0.15;
        const legZ = d / 2 - 0.15;
        [
          [-legX, -legZ], [legX, -legZ],
          [-legX, legZ], [legX, legZ]
        ].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(lx, tableH / 2, lz);
          group.add(leg);
        });

      } else if (sub === 'kuecheninsel') {
        const islandH = 0.95;
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, islandH, d), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
        body.position.y = islandH / 2;
        group.add(body);

        const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.06, d + 0.05), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 }));
        top.position.y = islandH + 0.03;
        group.add(top);

      } else if (sub === 'waschtisch') {
        const vanityH = 0.85;
        const vanity = new THREE.Mesh(new THREE.BoxGeometry(w, vanityH, d), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
        vanity.position.y = vanityH / 2;
        group.add(vanity);

      } else if (sub === 'wc_haenge') {
        const wc = new THREE.Mesh(new THREE.BoxGeometry(w, 0.45, d), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
        wc.position.y = 0.35;
        group.add(wc);

      } else if (sub && sub.includes('treppe')) {
        // Im ALL-Modus: nur aufsteigende Treppenläufe zeichnen (EG->1.OG, 1.OG->2.OG),
        // damit keine Treppen über das Dach hinausragen oder sich als X kreuzen!
        if (currentFloor === 'ALL' && sub.includes('ab')) {
          return;
        }

        const steps = 14;
        const stepMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.35 });
        const stairHeight = currentFloor === 'ALL' ? 3.2 : 2.5;

        for (let s = 0; s < steps; s++) {
          const stepW = w / steps;
          const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(stepW * 1.05, 0.08, d * 0.9), stepMat);
          const stepX = -w / 2 + (s + 0.5) * stepW;
          const stepY = (s / (steps - 1)) * stairHeight + 0.04;
          stepMesh.position.set(stepX, stepY, 0);
          stepMesh.castShadow = true;
          group.add(stepMesh);

          // Dezente Geländerpfosten auf der offenen Seite
          if (s % 3 === 0) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.75, 0.025), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 }));
            post.position.set(stepX, stepY + 0.38, d * 0.42);
            group.add(post);
          }
        }

        // Schlanker Handlauf exakt entlang der Treppensteigung
        const railLen = Math.hypot(w, stairHeight);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(railLen, 0.04, 0.05), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3 }));
        rail.position.set(0, stairHeight / 2 + 0.75, d * 0.42);
        rail.rotation.z = Math.atan2(stairHeight, w);
        group.add(rail);

      } else if (sub === 'fenster' || sub === 'fenster_gross') {
        const winH = 1.6;
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0x7dd3fc,
          transparent: true,
          opacity: 0.55,
          roughness: 0.1,
          transmission: 0.9
        });
        const glass = new THREE.Mesh(new THREE.BoxGeometry(w, winH, 0.06), glassMat);
        glass.position.y = 1.1;
        group.add(glass);

      } else if (sub === 'tuer') {
        const doorH = 2.1;
        const door = new THREE.Mesh(new THREE.BoxGeometry(w, doorH, 0.06), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 }));
        door.position.y = doorH / 2;
        group.add(door);

      } else if (sub === 'teppich_insel' || sub === 'teppich_rund' || sub === 'fliesen_zone') {
        const isRug = sub === 'teppich_insel' || sub === 'teppich_rund';
        let rugMat;
        if (f.textureImg) {
          const tex = new THREE.TextureLoader().load(f.textureImg);
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          const cm = parseFloat(f.textureScaleCm) || (isRug ? 80 : 50);
          const tileIn3DUnits = (cm / 100) / 0.5;
          tex.repeat.set(Math.max(1, w / Math.max(0.2, tileIn3DUnits)), Math.max(1, d / Math.max(0.2, tileIn3DUnits)));
          rugMat = new THREE.MeshStandardMaterial({ map: tex, roughness: isRug ? 0.9 : 0.3 });
        } else {
          rugMat = new THREE.MeshStandardMaterial({ color: isRug ? 0xd1d5db : 0xf1f5f9, roughness: isRug ? 0.9 : 0.3 });
        }
        let rug;
        if (sub === 'teppich_rund') {
          rug = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, 0.04, 24), rugMat);
        } else {
          rug = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), rugMat);
        }
        rug.position.y = 0.1;
        group.add(rug);

      } else {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(w, 0.75, d),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 })
        );
        mesh.position.y = 0.375;
        group.add(mesh);
      }

      scene3D.add(group);
    });

    // 4. Pflanzen in 3D
    elements.filter(el => el.type === 'plant').forEach(p => {
      const posX = (p.x - centerX) * SCALE_3D;
      const posZ = (p.y - centerY) * SCALE_3D;

      const plantGroup = new THREE.Group();
      plantGroup.position.set(posX, baseY, posZ);

      const potMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.7, 16), potMat);
      pot.position.y = 0.35;
      plantGroup.add(pot);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 });
      const crown1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), leafMat);
      crown1.position.y = 1.1;
      plantGroup.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), leafMat);
      crown2.position.set(0.25, 1.4, 0.1);
      plantGroup.add(crown2);

      scene3D.add(plantGroup);
    });
  });

  // 5. Dachstuhl / Echtes Giebeldach (Satteldach mit korrekter First-Neigung)
  if (show3DRoof && (currentFloor === 'ALL' || currentFloor === '2.OG')) {
    const roofBaseY = currentFloor === 'ALL' ? 6.4 + 1.6 : 2.6;
    const roofRidgeH = 3.0; // Firsthöhe
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }); // Dunkle Schiefer- / Ziegeloptik
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }); // Holzbalken

    // Firstbalken entlang des Daches
    const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.6, 0.18, 0.18), beamMat);
    ridgeBeam.position.set(0, roofBaseY + roofRidgeH, 0);
    scene3D.add(ridgeBeam);

    // Dreieckige Giebelwände (Ost & West) zur sauberen Wand-Schließung
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-houseD / 2, 0);
    gableShape.lineTo(houseD / 2, 0);
    gableShape.lineTo(0, roofRidgeH);
    gableShape.closePath();

    const gableGeo = new THREE.ShapeGeometry(gableShape);
    const gableMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8, side: THREE.DoubleSide });

    const gableW = new THREE.Mesh(gableGeo, gableMat);
    gableW.position.set(-houseW / 2, roofBaseY, 0);
    gableW.rotation.y = Math.PI / 2;
    scene3D.add(gableW);

    const gableE = new THREE.Mesh(gableGeo, gableMat);
    gableE.position.set(houseW / 2, roofBaseY, 0);
    gableE.rotation.y = Math.PI / 2;
    scene3D.add(gableE);

    // Korrekte Dachflächen (Satteldach /\ mit Spitze nach oben, KEIN umgekehrtes V)
    const slopeLen = Math.hypot(houseD / 2, roofRidgeH) + 0.3;
    const slopeAngle = Math.atan2(roofRidgeH, houseD / 2);

    // Dachfläche Nord (fällt von der Firstmitte z=0 nach Norden z=-houseD/2 ab)
    const roofPlaneN = new THREE.Mesh(
      new THREE.BoxGeometry(houseW + 0.6, 0.08, slopeLen),
      roofMat
    );
    roofPlaneN.position.set(0, roofBaseY + roofRidgeH / 2, -houseD / 4);
    roofPlaneN.rotation.x = -slopeAngle; // Minus-Zeichen neigt nach außen abwärts!
    roofPlaneN.castShadow = true;
    scene3D.add(roofPlaneN);

    // Dachfläche Süd (fällt von der Firstmitte z=0 nach Süden z=+houseD/2 ab)
    const roofPlaneS = new THREE.Mesh(
      new THREE.BoxGeometry(houseW + 0.6, 0.08, slopeLen),
      roofMat
    );
    roofPlaneS.position.set(0, roofBaseY + roofRidgeH / 2, houseD / 4);
    roofPlaneS.rotation.x = slopeAngle; // Plus-Zeichen neigt nach außen abwärts!
    roofPlaneS.castShadow = true;
    scene3D.add(roofPlaneS);
  }
}

// ----------------------------------------------------
// 4. PFLANZENMANAGER LOGIK
// ----------------------------------------------------
function renderPlants() {
  const container = document.getElementById('plants-list');
  container.innerHTML = '';

  let plantsDueCount = 0;

  appData.plants.forEach(plant => {
    const nextWater = calculateNextDueDate(plant.lastWatered, plant.waterInterval);
    const diffWater = getDaysDifference(nextWater);
    const waterDue = diffWater <= 0;

    const nextFert = calculateNextDueDate(plant.lastFertilized, plant.fertilizeInterval);
    const diffFert = getDaysDifference(nextFert);
    const fertDue = diffFert <= 0;

    if (waterDue || fertDue) plantsDueCount++;

    const card = document.createElement('div');
    card.className = `plant-card ${waterDue ? 'water-needed' : ''}`;
    card.innerHTML = `
      <div class="plant-header">
        <div>
          <div class="plant-title">🪴 ${plant.name}</div>
          <div class="plant-meta">📍 ${plant.location}</div>
        </div>
        <button class="btn btn-sm btn-ghost btn-del-plant" data-id="${plant.id}" title="Löschen">🗑️</button>
      </div>

      <div class="plant-status-row">
        <div class="plant-status-badge">
          <span>💧 Gießen:</span>
          <span class="${diffWater <= 0 ? 'due-overdue' : diffWater <= 1 ? 'due-soon' : 'due-future'}">
            ${diffWater < 0 ? `Überfällig (${Math.abs(diffWater)} T)` : diffWater === 0 ? 'Heute fällig!' : `in ${diffWater} Tag(en)`}
          </span>
          <small class="muted-text">(alle ${plant.waterInterval} T)</small>
        </div>

        <div class="plant-status-badge">
          <span>🌱 Düngen:</span>
          <span class="${diffFert <= 0 ? 'due-overdue' : 'due-future'}">
            ${diffFert <= 0 ? 'Jetzt düngen!' : `in ${diffFert} Tag(en)`}
          </span>
          <small class="muted-text">(alle ${plant.fertilizeInterval} T)</small>
        </div>

        ${plant.leavesDropping === 'yes' ? `
          <div style="font-size: 0.78rem; background: #fffbeb; color: #92400e; padding: 3px 6px; border-radius: 4px; margin-top: 3px;">
            🍂 Laubabwurf beachten: Regelmäßig Blätter aufsaugen / absammeln!
          </div>
        ` : ''}

        ${plant.notes ? `<div class="muted-text" style="font-size:0.8rem; margin-top:2px;">ℹ️ ${plant.notes}</div>` : ''}
      </div>

      <div class="plant-actions">
        <button class="btn btn-sm btn-secondary btn-water" data-id="${plant.id}">💧 Gegossen</button>
        <button class="btn btn-sm btn-secondary btn-fert" data-id="${plant.id}">🌱 Gedüngt</button>
      </div>
    `;

    card.querySelector('.btn-water').addEventListener('click', () => {
      plant.lastWatered = new Date().toISOString();
      saveData();
      renderPlants();
    });

    card.querySelector('.btn-fert').addEventListener('click', () => {
      plant.lastFertilized = new Date().toISOString();
      saveData();
      renderPlants();
    });

    card.querySelector('.btn-del-plant').addEventListener('click', () => {
      if (confirm(`Pflanze "${plant.name}" wirklich entfernen?`)) {
        appData.plants = appData.plants.filter(p => p.id !== plant.id);
        saveData();
        renderPlants();
      }
    });

    container.appendChild(card);
  });

  if (appData.plants.length === 0) {
    container.innerHTML = '<div class="empty-state">Noch keine Pflanzen eingetragen. Füge rechts deine Zimmerpflanzen hinzu!</div>';
  }

  const badge = document.getElementById('badge-plants');
  badge.textContent = plantsDueCount;
  badge.style.display = plantsDueCount > 0 ? 'inline-flex' : 'none';
}

function setupPlantForm() {
  const form = document.getElementById('form-new-plant');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('plant-name').value.trim();
    const location = document.getElementById('plant-location').value.trim();
    const waterInterval = parseInt(document.getElementById('plant-water-interval').value, 10) || 5;
    const fertilizeInterval = parseInt(document.getElementById('plant-fertilize-interval').value, 10) || 21;
    const leavesDropping = document.getElementById('plant-leaves-check').value;
    const notes = document.getElementById('plant-notes').value.trim();

    const newPlant = {
      id: 'p-' + Date.now(),
      name,
      location,
      waterInterval,
      fertilizeInterval,
      lastWatered: new Date().toISOString(),
      lastFertilized: new Date().toISOString(),
      leavesDropping,
      notes
    };

    appData.plants.push(newPlant);
    saveData();
    renderPlants();
    form.reset();
  });
}

// ----------------------------------------------------
// 5. EINKAUFSLISTE LOGIK
// ----------------------------------------------------
function renderShoppingList() {
  const container = document.getElementById('shopping-list');
  container.innerHTML = '';

  appData.shopping.forEach(item => {
    const row = document.createElement('div');
    row.className = `shopping-item ${item.done ? 'completed' : ''}`;
    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.6rem;">
        <input type="checkbox" ${item.done ? 'checked' : ''} class="shop-chk">
        <span class="item-text" style="font-weight: 500;">${item.text}</span>
        <span class="tag" style="font-size:0.7rem;">${item.category || 'Haushalt'}</span>
      </div>
      <button class="btn btn-sm btn-ghost btn-del-shop" title="Löschen">✕</button>
    `;

    row.querySelector('.shop-chk').addEventListener('change', (e) => {
      item.done = e.target.checked;
      saveData();
      renderShoppingList();
    });

    row.querySelector('.btn-del-shop').addEventListener('click', () => {
      appData.shopping = appData.shopping.filter(s => s.id !== item.id);
      saveData();
      renderShoppingList();
    });

    container.appendChild(row);
  });

  if (appData.shopping.length === 0) {
    container.innerHTML = '<div class="empty-state">Deine Einkaufsliste ist leer! Nutze die Schnellauswahl oben.</div>';
  }
}

function setupShopping() {
  const form = document.getElementById('form-new-shopping');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('shop-item-name').value.trim();
    const category = document.getElementById('shop-item-cat').value;
    if (!text) return;

    appData.shopping.push({
      id: 's-' + Date.now(),
      text,
      category,
      done: false
    });
    saveData();
    renderShoppingList();
    form.reset();
  });

  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemText = btn.dataset.item;
      const exists = appData.shopping.some(s => s.text.toLowerCase() === itemText.toLowerCase() && !s.done);
      if (!exists) {
        appData.shopping.push({
          id: 's-' + Date.now(),
          text: itemText,
          category: 'Reinigung & Pflege',
          done: false
        });
        saveData();
        renderShoppingList();
      }
    });
  });

  document.getElementById('btn-clear-completed-shopping').addEventListener('click', () => {
    appData.shopping = appData.shopping.filter(s => !s.done);
    saveData();
    renderShoppingList();
  });
}

// ----------------------------------------------------
// 6. FLECKEN- & REINIGUNGSRATGEBER
// ----------------------------------------------------
function renderStains() {
  const container = document.getElementById('stains-grid');
  const searchText = document.getElementById('stain-search-text').value.toLowerCase();
  const surfaceFilter = document.getElementById('stain-surface-filter').value;

  container.innerHTML = '';

  const filtered = STAINS_DATABASE.filter(stain => {
    const matchesSearch = stain.title.toLowerCase().includes(searchText) ||
                          stain.remedy.toLowerCase().includes(searchText) ||
                          stain.steps.some(s => s.toLowerCase().includes(searchText));
    const matchesSurface = surfaceFilter === 'all' || stain.surfaces.includes(surfaceFilter);
    return matchesSearch && matchesSurface;
  });

  filtered.forEach(stain => {
    const card = document.createElement('div');
    card.className = 'stain-card';
    card.innerHTML = `
      <div class="stain-header">
        <span class="stain-title">✨ ${stain.title}</span>
        <div style="display:flex; gap:0.25rem;">
          ${stain.surfaces.map(s => `<span class="stain-surface-tag">${s}</span>`).join('')}
        </div>
      </div>
      <div class="stain-remedy">
        <strong>Hausmittel:</strong> ${stain.remedy}
      </div>
      <div style="font-size:0.83rem; background:#eff6ff; color:#1e40af; padding:4px 8px; border-radius:6px;">
        <strong>Sofortmaßnahme:</strong> ${stain.firstAid}
      </div>
      <div style="margin-top: 0.3rem;">
        <strong style="font-size:0.85rem;">Schritt-für-Schritt:</strong>
        <ol class="stain-steps">
          ${stain.steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
      ${stain.warning ? `<div class="stain-warning">⚠️ <strong>Achtung:</strong> ${stain.warning}</div>` : ''}
    `;
    container.appendChild(card);
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">Kein passender Fleckentipp gefunden. Versuche ein anderes Suchwort!</div>';
  }
}

function setupStains() {
  document.getElementById('stain-search-text').addEventListener('input', renderStains);
  document.getElementById('stain-surface-filter').addEventListener('change', renderStains);
}

// ----------------------------------------------------
// INITIALISIERUNG
// ----------------------------------------------------
function renderAll() {
  renderTasks();
  renderPlants();
  renderShoppingList();
  renderStains();
  renderCanvas();
  updateInspector();
  if (activeViewMode === '3d') {
    update3DScene();
  }
}

// ----------------------------------------------------
// PANORAMA-RAUMGENERATOR LOGIK
// ----------------------------------------------------
let panoImage = null;
let panoCorners = [
  { x: 90, y: 190, label: 'Ecke 1' },
  { x: 260, y: 170, label: 'Ecke 2' },
  { x: 480, y: 175, label: 'Ecke 3' },
  { x: 640, y: 195, label: 'Ecke 4' }
];
let activePanoCornerIndex = -1;
let panoCanvasEl = null;
let panoCtx = null;

function setupPanoGeneratorEvents() {
  panoCanvasEl = document.getElementById('panoCanvas');
  if (!panoCanvasEl) return;
  panoCtx = panoCanvasEl.getContext('2d');

  const btnOpenModal = document.getElementById('btn-open-pano-generator');
  const modalPano = document.getElementById('modal-pano-generator');
  const btnCloseModal = document.getElementById('btn-close-pano-modal');
  const btnCancelModal = document.getElementById('btn-cancel-pano');
  const btnUploadPano = document.getElementById('btn-upload-pano');
  const fileInputPano = document.getElementById('panorama-file-input');
  const btnSamplePano = document.getElementById('btn-load-sample-pano');
  const btnGenerate = document.getElementById('btn-generate-from-pano');

  if (btnOpenModal && modalPano) {
    btnOpenModal.addEventListener('click', () => {
      modalPano.style.display = 'flex';
      if (!panoImage) {
        loadSamplePanoramaImage();
      } else {
        renderPanoCanvas();
      }
    });

    if (btnCloseModal) btnCloseModal.addEventListener('click', () => modalPano.style.display = 'none');
    if (btnCancelModal) btnCancelModal.addEventListener('click', () => modalPano.style.display = 'none');
  }

  if (btnUploadPano && fileInputPano) {
    btnUploadPano.addEventListener('click', () => fileInputPano.click());
    fileInputPano.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      document.getElementById('pano-file-name').textContent = file.name;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          panoImage = img;
          renderPanoCanvas();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnSamplePano) {
    btnSamplePano.addEventListener('click', loadSamplePanoramaImage);
  }

  // Maus-Interaktion für die 4 Eckpunkte
  panoCanvasEl.addEventListener('mousedown', (e) => {
    const rect = panoCanvasEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (panoCanvasEl.width / rect.width);
    const y = (e.clientY - rect.top) * (panoCanvasEl.height / rect.height);

    activePanoCornerIndex = -1;
    panoCorners.forEach((c, idx) => {
      if (Math.hypot(c.x - x, c.y - y) <= 14) {
        activePanoCornerIndex = idx;
      }
    });
  });

  window.addEventListener('mousemove', (e) => {
    if (activePanoCornerIndex === -1 || !panoCanvasEl) return;
    const rect = panoCanvasEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (panoCanvasEl.width / rect.width);
    const y = (e.clientY - rect.top) * (panoCanvasEl.height / rect.height);

    panoCorners[activePanoCornerIndex].x = Math.max(10, Math.min(panoCanvasEl.width - 10, x));
    panoCorners[activePanoCornerIndex].y = Math.max(20, Math.min(panoCanvasEl.height - 20, y));
    renderPanoCanvas();
  });

  window.addEventListener('mouseup', () => {
    activePanoCornerIndex = -1;
  });

  // Generierungs-Button
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      const roomName = document.getElementById('pano-room-name').value.trim() || 'Panorama-Raum';
      const m2 = parseFloat(document.getElementById('pano-room-m2').value) || 50;
      const surface = document.getElementById('pano-room-surface').value;
      const extractTexture = document.getElementById('pano-extract-texture').checked;
      const addWindows = document.getElementById('pano-add-windows').checked;

      // Raum-Dimensionen berechnen (Seitenverhältnis ca. 1.35 : 1)
      const ratio = 1.35;
      const widthM = Math.sqrt(m2 * ratio);
      const heightM = m2 / widthM;

      const wPx = Math.round(widthM * PIXELS_PER_METER);
      const hPx = Math.round(heightM * PIXELS_PER_METER);

      // Mittig auf der aktuellen Etage platzieren
      const spawnX = Math.round((canvas.width / 2) - (wPx / 2));
      const spawnY = Math.round((canvas.height / 2) - (hPx / 2));

      // 1. Textur aus dem Bodenbereich des Panoramas ausschneiden falls gewählt
      let extractedTextureUrl = null;
      if (extractTexture && panoImage) {
        const texCanvas = document.createElement('canvas');
        texCanvas.width = 256;
        texCanvas.height = 256;
        const texCtx = texCanvas.getContext('2d');
        // Unterer Bereich des Fotos (Boden/Parkett/Fliese)
        const sx = panoImage.width * 0.35;
        const sy = panoImage.height * 0.65;
        const sSize = Math.min(panoImage.width * 0.25, panoImage.height * 0.3);
        texCtx.drawImage(panoImage, sx, sy, sSize, sSize, 0, 0, 256, 256);
        extractedTextureUrl = texCanvas.toDataURL('image/jpeg', 0.88);
      }

      const newRoom = {
        id: 'r-' + Date.now(),
        type: 'room',
        name: roomName,
        surface,
        x: spawnX,
        y: spawnY,
        width: wPx,
        height: hPx,
        areaM2: m2,
        textureImg: extractedTextureUrl
      };

      if (!appData.floors[currentFloor]) appData.floors[currentFloor] = [];
      appData.floors[currentFloor].push(newRoom);
      selectedElement = newRoom;

      // 2. Fensterfronten automatisch entlang der Außenwand anbringen
      if (addWindows) {
        const winW = Math.round(Math.min(240, wPx * 0.55));
        const newWin = {
          id: 'w-' + Date.now(),
          type: 'furniture',
          subType: 'fenster_gross',
          label: 'Erkannte Fensterfront',
          x: spawnX + (wPx - winW) / 2,
          y: spawnY - 10,
          width: winW,
          height: 20
        };
        appData.floors[currentFloor].push(newWin);
      }

      saveData();
      modalPano.style.display = 'none';
      updateInspector();
      renderCanvas();
      if (activeViewMode === '3d') update3DScene();
      alert(`🎉 Raum "${roomName}" (${m2} m²) wurde erfolgreich mit originaler Boden-Textur und Fenstern generiert!`);
    });
  }
}

function loadSamplePanoramaImage() {
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 420;
  const cx = c.getContext('2d');

  // Weitwinkel-Hintergrund: Moderne offene 50m² Wohnküche mit Fensterfront
  // Wände (helles Creme-Grau)
  cx.fillStyle = '#e2e8f0';
  cx.fillRect(0, 0, 1200, 280);

  // Panoramafenster im Hintergrund mit Gartenblick
  cx.fillStyle = '#7dd3fc';
  cx.fillRect(250, 40, 520, 180);
  cx.strokeStyle = '#334155';
  cx.lineWidth = 4;
  cx.strokeRect(250, 40, 520, 180);
  // Fenstersprossen
  cx.beginPath();
  cx.moveTo(420, 40); cx.lineTo(420, 220);
  cx.moveTo(590, 40); cx.lineTo(590, 220);
  cx.stroke();

  // Sonnenlicht & Gartenbäume
  cx.fillStyle = '#86efac';
  cx.fillRect(254, 150, 512, 66);
  cx.fillStyle = '#fef08a';
  cx.beginPath(); cx.arc(320, 90, 30, 0, Math.PI * 2); cx.fill();

  // Warmes Eichen-Laminat / Parkett am Boden
  const grad = cx.createLinearGradient(0, 280, 0, 420);
  grad.addColorStop(0, '#b45309');
  grad.addColorStop(1, '#78350f');
  cx.fillStyle = grad;
  cx.fillRect(0, 280, 1200, 140);

  // Dielenfugen
  cx.strokeStyle = 'rgba(254, 243, 199, 0.25)';
  cx.lineWidth = 2;
  for (let y = 295; y < 420; y += 22) {
    cx.beginPath(); cx.moveTo(0, y); cx.lineTo(1200, y); cx.stroke();
  }

  // Deckenlinie
  cx.fillStyle = '#f8fafc';
  cx.fillRect(0, 0, 1200, 35);

  const img = new Image();
  img.onload = () => {
    panoImage = img;
    document.getElementById('pano-file-name').textContent = 'Muster-Panorama (Wohnküche 50m²)';
    renderPanoCanvas();
  };
  img.src = c.toDataURL('image/jpeg', 0.9);
}

function renderPanoCanvas() {
  if (!panoCtx || !panoCanvasEl) return;
  panoCtx.clearRect(0, 0, panoCanvasEl.width, panoCanvasEl.height);

  if (panoImage) {
    panoCtx.drawImage(panoImage, 0, 0, panoCanvasEl.width, panoCanvasEl.height);
  } else {
    panoCtx.fillStyle = '#1e293b';
    panoCtx.fillRect(0, 0, panoCanvasEl.width, panoCanvasEl.height);
    panoCtx.fillStyle = '#94a3b8';
    panoCtx.font = '14px sans-serif';
    panoCtx.textAlign = 'center';
    panoCtx.fillText('📸 Bitte wähle ein Panorama- oder Weitwinkelfoto', panoCanvasEl.width / 2, panoCanvasEl.height / 2);
    return;
  }

  // Verbindungslinien zwischen den erkannten Wand-Boden-Eckpunkten
  panoCtx.save();
  panoCtx.strokeStyle = '#facc15';
  panoCtx.lineWidth = 2.5;
  panoCtx.setLineDash([5, 4]);
  panoCtx.beginPath();
  panoCtx.moveTo(panoCorners[0].x, panoCorners[0].y);
  for (let i = 1; i < panoCorners.length; i++) {
    panoCtx.lineTo(panoCorners[i].x, panoCorners[i].y);
  }
  panoCtx.stroke();
  panoCtx.setLineDash([]);

  // Eckpunkte zeichnen
  panoCorners.forEach((c, idx) => {
    panoCtx.beginPath();
    panoCtx.arc(c.x, c.y, 8, 0, Math.PI * 2);
    panoCtx.fillStyle = '#facc15';
    panoCtx.fill();
    panoCtx.strokeStyle = '#0f172a';
    panoCtx.lineWidth = 2;
    panoCtx.stroke();

    panoCtx.fillStyle = '#ffffff';
    panoCtx.font = 'bold 10px sans-serif';
    panoCtx.textAlign = 'center';
    panoCtx.fillText(c.label, c.x, c.y - 12);
  });
  panoCtx.restore();
}

window.addEventListener('DOMContentLoaded', () => {
  // Service Worker für PWA-Installation (Home-Bildschirm am Smartphone/Tablet)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration error:', err));
  }

  initStorage();
  setupNavigation();
  setupTaskForm();
  setupFloorplan();
  setupPlantForm();
  setupShopping();
  setupStains();
  setupCropModalEvents();
  setupPanoGeneratorEvents();
  renderAll();
});
