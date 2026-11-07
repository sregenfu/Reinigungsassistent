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
// 1. PUTZ- & TERMINPLANER LOGIK
// ----------------------------------------------------
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
            ${task.notes ? `<span class="tag" style="background:#f1f5f9; color:#475569;" title="${task.notes}">ℹ️ ${task.notes}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="task-status">
        <div class="due-label ${dueClass}">${dueText}</div>
        <div class="task-actions" style="margin-top: 4px; justify-content: flex-end;">
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
  badge.textContent = dueCount;
  badge.style.display = dueCount > 0 ? 'inline-flex' : 'none';
}

function setupTaskForm() {
  const form = document.getElementById('form-new-task');
  const floorFilter = document.getElementById('filter-floor-task');

  floorFilter.addEventListener('change', renderTasks);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const floor = document.getElementById('task-floor').value;
    const room = document.getElementById('task-room').value.trim() || 'Allgemein';
    const surface = document.getElementById('task-surface').value;
    const intervalDays = parseInt(document.getElementById('task-interval').value, 10) || 7;
    const notes = document.getElementById('task-notes').value.trim();

    const newTask = {
      id: 't-' + Date.now(),
      title,
      floor,
      room,
      surface,
      intervalDays,
      lastDone: new Date().toISOString(),
      notes
    };

    appData.tasks.push(newTask);
    saveData();
    renderTasks();
    form.reset();
  });
}

// ----------------------------------------------------
// 2. 2D RAUM- & BODENPLANER (Canvas mit Umriss-Resizing & Detail-Grafiken)
// ----------------------------------------------------
const canvas = document.getElementById('floorCanvas');
const ctx = canvas.getContext('2d');

let currentTool = 'select'; // 'select' | 'room'
let selectedElement = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let dragStartX = 0;
let dragStartY = 0;

// Resize Handles für Umriss-Änderung: 8 Punkte (NW, N, NE, E, SE, S, SW, W)
let activeResizeHandle = null;
const HANDLE_SIZE = 8;

function getResizeHandles(el) {
  if (!el || el.type === 'plant') return [];
  const x = el.x;
  const y = el.y;
  const w = el.width;
  const h = el.height;
  return [
    { handle: 'nw', x: x, y: y },
    { handle: 'n',  x: x + w / 2, y: y },
    { handle: 'ne', x: x + w, y: y },
    { handle: 'e',  x: x + w, y: y + h / 2 },
    { handle: 'se', x: x + w, y: y + h },
    { handle: 's',  x: x + w / 2, y: y + h },
    { handle: 'sw', x: x, y: y + h },
    { handle: 'w',  x: x, y: y + h / 2 }
  ];
}

function getHandleUnderPoint(pt, el) {
  const handles = getResizeHandles(el);
  for (const h of handles) {
    if (Math.abs(pt.x - h.x) <= HANDLE_SIZE && Math.abs(pt.y - h.y) <= HANDLE_SIZE) {
      return h.handle;
    }
  }
  return null;
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

  // Tool Selector
  const toolBtns = document.querySelectorAll('.btn-tool');
  const surfaceGroup = document.getElementById('surface-selector-group');
  const bannerLeft = document.querySelector('.canvas-banner-left');

  function updateToolBanner(tool) {
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
      bannerLeft.innerHTML = '<span>💡 <strong>Auswahl & Skalieren:</strong> Klicke ein Element an, um es zu verschieben oder die m² zu ändern. An den 8 Eckpunkten kannst du den Umriss verziehen.</span>';
    }
  }

  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toolBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = btn.dataset.tool;
      surfaceGroup.style.display = currentTool === 'room' ? 'flex' : 'none';
      updateToolBanner(currentTool);
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

  // Canvas Mouse & Touch Events (iPhone / iPad / Finger / Apple Pencil)
  canvas.addEventListener('mousemove', handleCanvasMouseMove);
  canvas.addEventListener('mousedown', handleCanvasMouseDown);
  window.addEventListener('mouseup', handleCanvasMouseUp);

  // Intelligente Touch-Events: Scrollen auf Mobilgeräten wird NICHT blockiert,
  // es sei denn, der Nutzer zeichnet aktiv einen Raum/Wand oder zieht einen Griff/Möbelstück!
  canvas.addEventListener('touchstart', (e) => {
    if (currentTool === 'room' || currentTool === 'wall') {
      e.preventDefault();
      handleCanvasMouseDown(e);
      return;
    }

    const pt = getCanvasPoint(e);
    const hitHandle = selectedElement ? getHandleUnderPoint(pt, selectedElement) : null;
    let hitElement = null;
    const elements = appData.floors[currentFloor] || [];
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'plant') {
        if (Math.hypot(el.x - pt.x, el.y - pt.y) <= el.radius + 6) { hitElement = el; break; }
      } else {
        if (pt.x >= el.x && pt.x <= el.x + el.width && pt.y >= el.y && pt.y <= el.y + el.height) { hitElement = el; break; }
      }
    }

    if (hitHandle || hitElement) {
      e.preventDefault();
      handleCanvasMouseDown(e);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (isDrawing || activeResizeHandle) {
      e.preventDefault();
      handleCanvasMouseMove(e);
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (isDrawing) {
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

// Auswahlpool Initialisierung
function setupCatalogItems() {
  const items = document.querySelectorAll('.catalog-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      const label = item.dataset.label || 'Objekt';
      const w = parseInt(item.dataset.w, 10) || 120;
      const h = parseInt(item.dataset.h, 10) || 80;

      // In der Mitte des Canvas platzieren
      const spawnX = Math.round((canvas.width / 2) - (w / 2));
      const spawnY = Math.round((canvas.height / 2) - (h / 2));

      let newElement = null;
      if (type.startsWith('pflanze_')) {
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
          label: label
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

  return {
    x: Math.round((clientX - rect.left) * scaleX),
    y: Math.round((clientY - rect.top) * scaleY)
  };
}

function handleCanvasMouseMove(evt) {
  const pt = getCanvasPoint(evt);
  const meterX = (pt.x / PIXELS_PER_METER).toFixed(1);
  const meterY = (pt.y / PIXELS_PER_METER).toFixed(1);
  document.getElementById('canvas-coords').textContent = `X: ${meterX} m (${pt.x}px), Y: ${meterY} m (${pt.y}px)`;

  // Cursor anpassen falls über Resize-Handle
  if (selectedElement && !isDrawing) {
    const handle = getHandleUnderPoint(pt, selectedElement);
    if (handle) {
      if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
      else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
      else if (handle === 'n' || handle === 's') canvas.style.cursor = 'ns-resize';
      else if (handle === 'e' || handle === 'w') canvas.style.cursor = 'ew-resize';
    } else {
      canvas.style.cursor = currentTool === 'room' ? 'crosshair' : 'default';
    }
  }

  if (isDrawing && activeResizeHandle && selectedElement) {
    // Umriss durch Ziehen am Griff verändern!
    const dx = pt.x - dragStartX;
    const dy = pt.y - dragStartY;
    dragStartX = pt.x;
    dragStartY = pt.y;

    const el = selectedElement;
    const minSize = 20;

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

    updateInspector();
    renderCanvas();

  } else if (isDrawing && currentTool === 'room') {
    renderCanvas();
    const w = pt.x - startX;
    const h = pt.y - startY;
    const m2 = calculateAreaM2(Math.abs(w), Math.abs(h));

    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
    ctx.fillRect(startX, startY, w, h);
    ctx.strokeRect(startX, startY, w, h);

    // Live m² Tooltip
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${(Math.abs(w)/PIXELS_PER_METER).toFixed(1)}m × ${(Math.abs(h)/PIXELS_PER_METER).toFixed(1)}m = ${m2} m²`, pt.x + 10, pt.y - 10);
    ctx.restore();

  } else if (isDrawing && currentTool === 'wall') {
    renderCanvas();
    const w = pt.x - startX;
    const h = pt.y - startY;
    ctx.save();
    ctx.fillStyle = 'rgba(51, 65, 85, 0.7)';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    // Wandstärke mindestens 12px
    const drawW = Math.abs(w) > Math.abs(h) ? w : (w >= 0 ? 14 : -14);
    const drawH = Math.abs(w) > Math.abs(h) ? (h >= 0 ? 14 : -14) : h;
    ctx.fillRect(startX, startY, drawW, drawH);
    ctx.strokeRect(startX, startY, drawW, drawH);
    ctx.restore();

  } else if (isDrawing && currentTool === 'select' && selectedElement && !activeResizeHandle) {
    // Ganzes Element verschieben
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
  const elements = appData.floors[currentFloor] || [];

  if (currentTool === 'select') {
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

    // 2. Element auswählen (von oben nach unten prüfen)
    selectedElement = null;
    activeResizeHandle = null;

    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'plant') {
        const dist = Math.hypot(el.x - pt.x, el.y - pt.y);
        if (dist <= el.radius + 6) {
          selectedElement = el;
          break;
        }
      } else {
        if (pt.x >= el.x && pt.x <= el.x + el.width && pt.y >= el.y && pt.y <= el.y + el.height) {
          selectedElement = el;
          break;
        }
      }
    }

    if (selectedElement) {
      isDrawing = true;
      dragStartX = pt.x;
      dragStartY = pt.y;
    }
    updateInspector();
    renderCanvas();

  } else if (currentTool === 'room' || currentTool === 'wall') {
    isDrawing = true;
    startX = pt.x;
    startY = pt.y;
  }
}

function handleCanvasMouseUp(evt) {
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
        areaM2: area
      };

      if (!appData.floors[currentFloor]) appData.floors[currentFloor] = [];
      appData.floors[currentFloor].push(newRoom);
      selectedElement = newRoom;
      saveData();
      updateInspector();
    }
  } else if (currentTool === 'wall') {
    const pt = getCanvasPoint(evt);
    let w = Math.abs(pt.x - startX);
    let h = Math.abs(pt.y - startY);
    let x = Math.min(startX, pt.x);
    let y = Math.min(startY, pt.y);

    if (w > 15 || h > 15) {
      // Automatisch ausrichten (horizontal oder vertikal)
      if (w > h) {
        h = 14; // Standard-Wandstärke ca. 35cm
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
      saveData();
      updateInspector();
    }
  } else if (currentTool === 'select') {
    saveData();
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

// 9. Treppen (Aufwärts oder Abwärts mit Etagenverbindung)
function drawOpenStairs(ctx, el) {
  const { x, y, width: w, height: h } = el;
  const isUp = el.subType === 'treppe_auf' || (!el.subType.includes('ab'));
  ctx.save();

  // Treppenkörper
  ctx.fillStyle = isUp ? '#fef9c3' : '#f1f5f9';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = isUp ? '#ca8a04' : '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Freitragende Holzstufen mit Schatten
  const steps = 7;
  const stepW = w / steps;

  for (let i = 0; i < steps; i++) {
    const sx = x + i * stepW;
    // Stufenschatten
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(sx, y, 4, h);

    // Stufenkante
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx, y + h);
    ctx.stroke();
  }

  // Treppen-Geländer
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 4);
  ctx.lineTo(x + w - 4, y + 4);
  ctx.stroke();

  // Steigungspfeil mit Ziel-Etage
  const arrowColor = isUp ? '#ca8a04' : '#2563eb';
  ctx.strokeStyle = arrowColor;
  ctx.fillStyle = arrowColor;
  ctx.lineWidth = 2.5;

  const startArrowX = isUp ? x + 15 : x + w - 25;
  const endArrowX = isUp ? x + w - 25 : x + 15;
  const arrowHeadDir = isUp ? 1 : -1;

  ctx.beginPath();
  ctx.moveTo(startArrowX, y + h / 2);
  ctx.lineTo(endArrowX, y + h / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endArrowX, y + h / 2 - 6);
  ctx.lineTo(endArrowX + arrowHeadDir * 12, y + h / 2);
  ctx.lineTo(endArrowX, y + h / 2 + 6);
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

// 9c. Türen mit Schwenkbereich
function drawDoor(ctx, el) {
  const { x, y, width: w, height: h } = el;
  ctx.save();

  // Türrahmen / Zarge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Türblatt & 90°-Öffnungsbogen
  const r = Math.max(w, h);
  ctx.strokeStyle = '#94a3b8';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Türblatt
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + r);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('🚪 Tür', x + 5, y + 14);

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

// 11. Detaillierte Pflanzen (Monstera & Ficus)
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

  // Große Monstera Blätter
  const isMonstera = subType === 'pflanze_gross' || name.toLowerCase().includes('monstera');
  const leafCount = isMonstera ? 6 : 8;

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

  // Text Label
  ctx.fillStyle = '#14532d';
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🪴 ' + name, x, y + r + 15);

  ctx.restore();
}

// Haupt-Renderfunktion für 2D Canvas
function renderCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Feines Konstruktions-Raster (40px = 1 Meter)
  ctx.save();
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += PIXELS_PER_METER) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += PIXELS_PER_METER) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  ctx.restore();

  const elements = appData.floors[currentFloor] || [];

  // 1. Zuerst Räume rendern (Hintergrund-Ebene)
  elements.filter(el => el.type === 'room').forEach(room => {
    drawSurfacePattern(ctx, room.surface, room.x, room.y, room.width, room.height, room.textureImg, room.textureScaleCm || 50);

    // Raum-Außenwände (Solide Mauerstärke)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(room.x, room.y, room.width, room.height);

    // Raum-Beschriftung & m²
    const m2 = room.areaM2 || calculateAreaM2(room.width, room.height);
    const wM = (room.width / PIXELS_PER_METER).toFixed(1);
    const hM = (room.height / PIXELS_PER_METER).toFixed(1);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${room.name}`, room.x + 12, room.y + 24);

    ctx.fillStyle = '#475569';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Fläche: ${m2} m² (${wM} m × ${hM} m) • Boden: ${room.surface.toUpperCase()}`, room.x + 12, room.y + 42);
  });

  // 2. Wände rendern (Massive Trennwände)
  elements.filter(el => el.type === 'wall').forEach(w => {
    drawWall(ctx, w);
  });

  // 3. Möbel & Raumelemente rendern
  elements.filter(el => el.type === 'furniture').forEach(f => {
    const sub = f.subType;
    if (sub === 'couch_eck') {
      drawDesignerCouchL(ctx, f);
    } else if (sub === 'couch_3er') {
      drawSofa3(ctx, f);
    } else if (sub === 'tisch_gross') {
      drawDiningTableWithChairs(ctx, f);
    } else if (sub === 'tisch_rund') {
      drawRoundTableWithChairs(ctx, f);
    } else if (sub === 'kuecheninsel') {
      drawKitchenIsland(ctx, f);
    } else if (sub === 'waschtisch') {
      drawModernWaschtisch(ctx, f);
    } else if (sub === 'wc_haenge') {
      drawHangingToilet(ctx, f);
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
      // Standard Möbelkasten
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
  });

  // 4. Pflanzen rendern
  elements.filter(el => el.type === 'plant').forEach(p => {
    drawDetailedPlant(ctx, p);
  });

  // 5. Highlight & Umriss-Resize-Griffe für ausgewähltes Element
  if (selectedElement) {
    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);

    if (selectedElement.type === 'plant') {
      ctx.beginPath();
      ctx.arc(selectedElement.x, selectedElement.y, selectedElement.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(selectedElement.x - 2, selectedElement.y - 2, selectedElement.width + 4, selectedElement.height + 4);

      // 8 Resize Handles zeichnen (Ecken & Kanten zum Verändern des Umrisses)
      ctx.setLineDash([]);
      const handles = getResizeHandles(selectedElement);
      handles.forEach(h => {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      });
    }
    ctx.restore();
  }
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
          <span class="sample-chip" data-sample="samt">🛋️ Stoff/Polster</span>
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
      el.textureScaleCm = sampleType === 'marmor' ? 60 : sampleType === 'eiche' ? 40 : 50;
      saveData();
      updateInspector();
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

      <div class="inspector-field">
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
        <button id="btn-insp-add-task" class="btn btn-sm btn-primary">➕ Putzaufgabe für diesen Raum verknüpfen</button>
        <button id="btn-insp-del" class="btn btn-sm btn-danger">🗑️ Raum löschen</button>
      </div>
    `;

    bindTextureControlEvents(el);

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

      <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
        <button id="btn-insp-rotate-wall" class="btn btn-sm btn-secondary full-width">🔄 90° Drehen (horizontal/vertikal)</button>
      </div>

      ${getTextureControlHTML(el)}

      <div class="tip-box" style="margin-top:0.6rem; padding:0.6rem;">
        <strong>🧱 Wand-Info:</strong>
        <p style="font-size:0.82rem; margin-top:0.3rem;">Wände trennen Räume akustisch und optisch ab und können mit Fotos deiner realen Tapete oder Putzstruktur versehen werden.</p>
      </div>

      <div style="margin-top:1rem;">
        <button id="btn-insp-del" class="btn btn-sm btn-danger full-width">🗑️ Wand entfernen</button>
      </div>
    `;

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
    });

    document.getElementById('btn-insp-del').addEventListener('click', () => {
      deleteSelectedElement();
    });

  } else if (el.type === 'furniture') {
    const isWindow = el.subType === 'fenster' || el.subType === 'fenster_gross';
    const isStairs = el.subType && el.subType.includes('treppe');
    const wM = (el.width / PIXELS_PER_METER).toFixed(2);
    const hM = (el.height / PIXELS_PER_METER).toFixed(2);

    panel.innerHTML = `
      <div class="inspector-field">
        <label>${isWindow ? 'Fenster-Bezeichnung' : isStairs ? 'Treppen-Bezeichnung' : 'Möbelstück / Objekt'}</label>
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

      <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
        <button id="btn-insp-rotate" class="btn btn-sm btn-secondary full-width">🔄 90° Drehen</button>
      </div>

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

    if (!isWindow && !isStairs) {
      bindTextureControlEvents(el);
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
      }
    });

    document.getElementById('insp-fh').addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (val > 0) {
        el.height = Math.round(val * PIXELS_PER_METER);
        saveData();
        renderCanvas();
      }
    });

    document.getElementById('btn-insp-rotate').addEventListener('click', () => {
      const tmp = el.width;
      el.width = el.height;
      el.height = tmp;
      document.getElementById('insp-fw').value = (el.width / PIXELS_PER_METER).toFixed(2);
      document.getElementById('insp-fh').value = (el.height / PIXELS_PER_METER).toFixed(2);
      saveData();
      renderCanvas();
    });

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
        <input type="number" id="insp-plant-r" min="15" max="100" value="${Math.round(el.radius * 2.5)}">
      </div>
      <div class="tip-box" style="margin-top: 0.5rem; padding: 0.6rem;">
        <strong>Tipp für Großpflanzen:</strong>
        <p style="font-size:0.82rem; margin-top:0.3rem;">Auf Teppich & Laminat stets Untersetzer mit Pflanzrollen verwenden!</p>
      </div>
      <div style="margin-top:1rem;">
        <button id="btn-insp-del" class="btn btn-sm btn-danger full-width">🗑️ Pflanze entfernen</button>
      </div>
    `;

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

      const sub = f.subType;

      if (sub === 'couch_eck' || sub === 'couch_3er') {
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

      } else if (sub === 'teppich_insel' || sub === 'fliesen_zone') {
        const isRug = sub === 'teppich_insel';
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
        const rug = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), rugMat);
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
