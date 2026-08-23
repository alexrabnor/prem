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

export function kommandeUppgifter(prenumerationer, dagar = 30) {
  const idag = new Date().getDate();
  return prenumerationer
    .filter(p => p.aktiv !== false)
    .map(p => {
      const dag = Number(p.dragningsdag) || 1;
      let dagarKvar = dag >= idag ? dag - idag : 31 - idag + dag;
      return { ...p, dagarKvar };
    })
    .filter(p => p.dagarKvar <= dagar)
    .sort((a, b) => a.dagarKvar - b.dagarKvar);
}

