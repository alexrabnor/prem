import React from 'react';
import { motion } from 'framer-motion';
import {
  formateraBelopp, formateraPris, formateraKortDatum, formateraDagarKvar,
  månadskostnad, årskostnad, kostnadPerKategori, kommandeUppgifter,
  getFaviconUrl, getKategori,
} from '../utils';

const MÅNADSNAMN = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function Hero({ prenumerationer }) {
  const aktiva = prenumerationer.filter(p => p.aktiv !== false);
  const totalMånad = aktiva.reduce((s, p) => s + månadskostnad(p.kostnad, p.intervall), 0);
  const totalÅr = aktiva.reduce((s, p) => s + årskostnad(p.kostnad, p.intervall), 0);
  const snitt = aktiva.length ? totalMånad / aktiva.length : 0;

  const idag = new Date();
  const period = `${MÅNADSNAMN[idag.getMonth()]} ${idag.getFullYear()}`;

  // Vad som återstår att dras den här månaden – ersätter mockupens "+62 kr mot juli",
  // som hade krävt historik. Detta går att räkna fram ur datan vi faktiskt har.
  const kvarIMånaden = aktiva
    .filter(p => p.intervall !== 'yearly' && Number(p.dragningsdag) >= idag.getDate())
    .reduce((s, p) => s + Number(p.kostnad), 0);

  const kategorier = kostnadPerKategori(aktiva);
  const nästa = kommandeUppgifter(prenumerationer, 60)[0];

  // Stapeldiagram per kategori. Mockupen visade sex månader bakåt, men appen sparar
  // ingen historik – samma visuella rytm, fylld med kostnad per kategori i stället.
  const staplar = kategorier.slice(0, 6);
  const maxBelopp = Math.max(...staplar.map(k => k.belopp), 1);

  const nästaFavicon = nästa ? getFaviconUrl(nästa.url) : null;
  const nästaKategori = nästa ? getKategori(nästa.kategori) : null;

  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="hero-main">
        <div className="hero-period">
          <span className="eyebrow">{period}</span>
          {kvarIMånaden > 0 && (
            <span className="hero-pill">{formateraPris(kvarIMånaden)} kvar att dras</span>
          )}
        </div>

        <div className="hero-total">
          <b>{formateraBelopp(totalMånad)}</b>
          <span>kr / mån</span>
        </div>

        <div className="stack">
          {kategorier.length === 0 ? (
            <div className="stack-empty" />
          ) : (
            kategorier.map(k => (
              <div
                key={k.namn}
                style={{ width: `${(k.belopp / totalMånad) * 100}%`, background: k.färg }}
                title={`${k.namn}: ${formateraPris(k.belopp)}/mån`}
              />
            ))
          )}
        </div>

        <div className="legend">
          {kategorier.slice(0, 5).map(k => (
            <span className="legend-item" key={k.namn}>
              <span className="legend-dot" style={{ background: k.färg }} />
              {k.namn} {formateraBelopp(k.belopp)}
            </span>
          ))}
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="eyebrow-dim">Per år</span>
            <b>{formateraBelopp(totalÅr)} kr</b>
          </div>
          <div className="hero-stat">
            <span className="eyebrow-dim">Aktiva</span>
            <b>{aktiva.length} {aktiva.length === 1 ? 'tjänst' : 'tjänster'}</b>
          </div>
          <div className="hero-stat">
            <span className="eyebrow-dim">Snitt</span>
            <b>{formateraBelopp(snitt)} kr</b>
          </div>
        </div>
      </div>

      <div className="hero-side">
        {nästa && (
          <div className="next-card">
            {nästaFavicon ? (
              <img src={nästaFavicon} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <span style={{ fontSize: 26 }}>{nästaKategori.emoji}</span>
            )}
            <div className="next-card-body">
              <span className="eyebrow">Nästa dragning</span>
              <b>{nästa.namn} · {formateraKortDatum(nästa.datum)}</b>
            </div>
            <span className="next-badge">{formateraDagarKvar(nästa.dagarKvar)}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div className="bars-head">
            <span className="eyebrow-dim">Kostnad per kategori</span>
            <span className="bars-note">{formateraBelopp(totalMånad)} kr / mån</span>
          </div>
          <div className="bars">
            {staplar.length === 0 ? (
              <span className="bar-label">Lägg till en tjänst för att se fördelningen</span>
            ) : (
              staplar.map((k, i) => (
                <div className={`bar-col${i === 0 ? ' is-top' : ''}`} key={k.namn}>
                  <motion.div
                    className={`bar${i === 0 ? ' top' : ''}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((k.belopp / maxBelopp) * 100, 7)}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                    title={`${k.namn}: ${formateraPris(k.belopp)}/mån`}
                  />
                  <span className="bar-label">{k.emoji}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Hero;
