export const KATEGORIER = [
  { namn: 'Streaming', färg: '#E54D42', emoji: '🎬' },
  { namn: 'Musik', färg: '#9C27B0', emoji: '🎵' },
  { namn: 'Moln', färg: '#2196F3', emoji: '☁️' },
  { namn: 'Programvara', färg: '#4CAF50', emoji: '💻' },
  { namn: 'AI', färg: '#00BCD4', emoji: '🤖' },
  { namn: 'Sport', färg: '#8BC34A', emoji: '⚽' },
  { namn: 'Tidningar', färg: '#795548', emoji: '📰' },
  { namn: 'Gaming', färg: '#673AB7', emoji: '🎮' },
  { namn: 'Försäkring', färg: '#607D8B', emoji: '🛡️' },
  { namn: 'Övrigt', färg: '#FF9800', emoji: '📦' },
];

export const PRESETS = [
  { namn: 'Netflix', kostnad: 129, intervall: 'monthly', kategori: 'Streaming', url: 'netflix.com' },
  { namn: 'Spotify', kostnad: 119, intervall: 'monthly', kategori: 'Musik', url: 'spotify.com' },
  { namn: 'ChatGPT Plus', kostnad: 220, intervall: 'monthly', kategori: 'AI', url: 'chatgpt.com' },
  { namn: 'Google One / iCloud', kostnad: 190, intervall: 'yearly', kategori: 'Moln', url: 'one.google.com' },
  { namn: 'Disney+', kostnad: 89, intervall: 'monthly', kategori: 'Streaming', url: 'disneyplus.com' },
  { namn: 'YouTube Premium', kostnad: 119, intervall: 'monthly', kategori: 'Streaming', url: 'youtube.com' },
  { namn: 'HBO Max', kostnad: 89, intervall: 'monthly', kategori: 'Streaming', url: 'hbomax.com' },
  { namn: 'Viaplay', kostnad: 169, intervall: 'monthly', kategori: 'Sport', url: 'viaplay.se' },
  { namn: 'Storytel', kostnad: 189, intervall: 'monthly', kategori: 'Tidningar', url: 'storytel.com' },
  { namn: 'Gym / SATS', kostnad: 499, intervall: 'monthly', kategori: 'Sport', url: 'sats.se' },
  { namn: 'GitHub Copilot', kostnad: 105, intervall: 'monthly', kategori: 'Programvara', url: 'github.com' },
  { namn: 'PlayStation Plus', kostnad: 95, intervall: 'monthly', kategori: 'Gaming', url: 'playstation.com' },
];

export function formateraPris(belopp) {
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(belopp);
}

/** Belopp utan valutasuffix – hero och kort sätter "kr" som egen typografi. */
export function formateraBelopp(belopp) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(belopp);
}

export function månadskostnad(kostnad, intervall) {
  return intervall === 'yearly' ? Number(kostnad) / 12 : Number(kostnad);
}

export function årskostnad(kostnad, intervall) {
  return intervall === 'monthly' ? Number(kostnad) * 12 : Number(kostnad);
}

export function getFaviconUrl(url) {
  if (!url) return null;
  const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function getKategori(namn) {
  return KATEGORIER.find(k => k.namn === namn) || KATEGORIER[KATEGORIER.length - 1];
}

/** Tonad bakgrund + läsbar text ur kategorifärgen, så pillren inte kräver en andra palett. */
export function kategoriTon(färg) {
  return {
    background: `color-mix(in srgb, ${färg} 13%, #fff)`,
    color: `color-mix(in srgb, ${färg} 72%, #12100F)`,
  };
}

const MÅNADER = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/**
 * Nästa gång pengarna dras. Räknar på riktiga datum i stället för att anta 31-dagarsmånader,
 * och klampar dagen till månadens sista dag (en dragning den 31:e sker den 28/29 i februari).
 */
export function nästaDragning(dragningsdag, från = new Date()) {
  const dag = Math.min(Math.max(Number(dragningsdag) || 1, 1), 31);
  const idag = new Date(från.getFullYear(), från.getMonth(), från.getDate());

  const iMånad = (år, månad) => {
    const sista = new Date(år, månad + 1, 0).getDate();
    return new Date(år, månad, Math.min(dag, sista));
  };

  let datum = iMånad(idag.getFullYear(), idag.getMonth());
  if (datum < idag) datum = iMånad(idag.getFullYear(), idag.getMonth() + 1);

  const dagarKvar = Math.round((datum - idag) / 86400000);
  return { datum, dagarKvar };
}

export function formateraKortDatum(datum) {
  return `${datum.getDate()} ${MÅNADER[datum.getMonth()]}`;
}

export function månadsEtikett(datum) {
  return MÅNADER[datum.getMonth()];
}

export function formateraDagarKvar(dagarKvar) {
  if (dagarKvar === 0) return 'idag';
  if (dagarKvar === 1) return 'i morgon';
  return `om ${dagarKvar} d`;
}

/** Aktiva prenumerationer sorterade på hur nära nästa dragning ligger. */
export function kommandeUppgifter(prenumerationer, dagar = 30) {
  return prenumerationer
    .filter(p => p.aktiv !== false)
    .map(p => ({ ...p, ...nästaDragning(p.dragningsdag) }))
    .filter(p => p.dagarKvar <= dagar)
    .sort((a, b) => a.dagarKvar - b.dagarKvar);
}

/** Månadskostnad per kategori, största först. Underlaget för både staplar och legend. */
export function kostnadPerKategori(prenumerationer) {
  const summor = new Map();
  prenumerationer
    .filter(p => p.aktiv !== false)
    .forEach(p => {
      const namn = p.kategori || 'Övrigt';
      summor.set(namn, (summor.get(namn) || 0) + månadskostnad(p.kostnad, p.intervall));
    });

  return [...summor.entries()]
    .map(([namn, belopp]) => ({ ...getKategori(namn), namn, belopp }))
    .sort((a, b) => b.belopp - a.belopp);
}
