import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Info } from 'lucide-react';
import { Tjänsteikon } from './SubscriptionList';
import {
  formateraBelopp, formateraPris, getKategori, kategoriTon, månadskostnad,
} from '../utils';

const VECKODAGAR = ['mån', 'tis', 'ons', 'tors', 'fre', 'lör', 'sön'];
const MÅNADSNAMN = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function sammaDag(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function Kalender({ prenumerationer, onEdit }) {
  const idag = new Date();
  const [visad, setVisad] = useState(() => new Date(idag.getFullYear(), idag.getMonth(), 1));

  const år = visad.getFullYear();
  const månad = visad.getMonth();

  const { rutor, månadsvisa, årsvisa, summa } = useMemo(() => {
    const dagarIMånaden = new Date(år, månad + 1, 0).getDate();
    // Måndag först: getDay() ger 0 för söndag, så vi roterar veckan ett steg.
    const start = (new Date(år, månad, 1).getDay() + 6) % 7;

    const månadsvisa = prenumerationer.filter(p => p.intervall !== 'yearly');
    const årsvisa = prenumerationer.filter(p => p.intervall === 'yearly');

    // En dragning den 31:e ska landa den 28:e i februari, inte försvinna.
    const perDag = new Map();
    månadsvisa.forEach(p => {
      const dag = Math.min(Math.max(Number(p.dragningsdag) || 1, 1), dagarIMånaden);
      if (!perDag.has(dag)) perDag.set(dag, []);
      perDag.get(dag).push(p);
    });

    const rutor = [];
    for (let i = 0; i < start; i++) rutor.push({ nyckel: `tom-${i}`, tom: true });
    for (let d = 1; d <= dagarIMånaden; d++) {
      rutor.push({
        nyckel: `dag-${d}`,
        dag: d,
        datum: new Date(år, månad, d),
        poster: (perDag.get(d) || []).sort((a, b) => Number(b.kostnad) - Number(a.kostnad)),
      });
    }

    const summa = månadsvisa
      .filter(p => p.aktiv !== false)
      .reduce((s, p) => s + Number(p.kostnad), 0);

    return { rutor, månadsvisa, årsvisa, summa };
  }, [prenumerationer, år, månad]);

  const byt = steg => setVisad(new Date(år, månad + steg, 1));
  const ärDennaMånad = år === idag.getFullYear() && månad === idag.getMonth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="section-head">
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => byt(-1)} aria-label="Föregående månad">
            <ChevronLeft size={18} />
          </button>
          <h2 className="cal-title">{MÅNADSNAMN[månad]} {år}</h2>
          <button className="icon-btn" onClick={() => byt(1)} aria-label="Nästa månad">
            <ChevronRight size={18} />
          </button>
          {!ärDennaMånad && (
            <button className="pill" onClick={() => setVisad(new Date(idag.getFullYear(), idag.getMonth(), 1))}>
              Idag
            </button>
          )}
        </div>

        <div className="cal-sum">
          <span className="cal-sum-label">Dras denna månad</span>
          <b>{formateraPris(summa)}</b>
        </div>
      </div>

      <div className="cal-grid-wrap">
        <div className="cal-weekdays">
          {VECKODAGAR.map(d => <span key={d}>{d}</span>)}
        </div>

        <div className="cal-grid">
          {rutor.map((ruta, i) =>
            ruta.tom ? (
              <div className="cal-cell is-empty" key={ruta.nyckel} />
            ) : (
              <motion.div
                className={`cal-cell${sammaDag(ruta.datum, idag) ? ' is-today' : ''}${ruta.poster.length ? ' has-items' : ''}`}
                key={ruta.nyckel}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, delay: Math.min(i, 20) * 0.008 }}
              >
                <span className="cal-daynum">{ruta.dag}</span>

                <div className="cal-items">
                  {ruta.poster.map(p => {
                    const kategori = getKategori(p.kategori);
                    const aktiv = p.aktiv !== false;
                    return (
                      <button
                        key={p.id}
                        className={`cal-chip${aktiv ? '' : ' is-paused'}`}
                        style={aktiv ? kategoriTon(kategori.färg) : undefined}
                        onClick={() => onEdit(p)}
                        title={`${p.namn} · ${formateraPris(p.kostnad)}${aktiv ? '' : ' (pausad)'}`}
                      >
                        <Tjänsteikon url={p.url} emoji={kategori.emoji} className="cal-chip-icon" />
                        <span className="cal-chip-name">{p.namn}</span>
                        <span className="cal-chip-amount">{formateraBelopp(p.kostnad)}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ),
          )}
        </div>
      </div>

      {årsvisa.length > 0 && (
        <div className="cal-yearly">
          <div className="cal-yearly-head">
            <Info size={15} />
            <span>
              Årsvisa prenumerationer har bara en dragningsdag sparad, inte vilken månad –
              de visas därför separat.
            </span>
          </div>
          <div className="cal-yearly-list">
            {årsvisa.map(p => {
              const kategori = getKategori(p.kategori);
              return (
                <button
                  key={p.id}
                  className={`cal-yearly-item${p.aktiv === false ? ' is-paused' : ''}`}
                  onClick={() => onEdit(p)}
                >
                  <Tjänsteikon url={p.url} emoji={kategori.emoji} className="cal-chip-icon" />
                  <span className="cal-yearly-name">{p.namn}</span>
                  <span className="cal-yearly-day">den {p.dragningsdag}:e</span>
                  <span className="cal-yearly-amount">
                    {formateraBelopp(p.kostnad)} kr/år
                    <em>≈ {formateraBelopp(månadskostnad(p.kostnad, 'yearly'))} kr/mån</em>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {månadsvisa.length === 0 && årsvisa.length === 0 && (
        <div className="empty">
          <span className="emoji"><CalendarDays size={34} /></span>
          <h3>Inget att visa i kalendern</h3>
          <p>Lägg till en prenumeration så dyker den upp på sin dragningsdag här.</p>
        </div>
      )}
    </div>
  );
}

export default Kalender;
