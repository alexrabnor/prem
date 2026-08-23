import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CreditCard, Plus, Search, RefreshCw, WifiOff } from 'lucide-react';

import Hero from './components/Hero';
import SubscriptionList from './components/SubscriptionList';
import SubscriptionForm from './components/SubscriptionForm';
import Kalender from './components/Kalender';
import {
  hamtaPrenumerationer, skapaPrenumeration, uppdateraPrenumeration, taBortPrenumeration,
} from './api';
import { KATEGORIER, kommandeUppgifter } from './utils';

const FLIKAR = [
  { id: 'oversikt', namn: 'Översikt' },
  { id: 'tjanster', namn: 'Tjänster' },
  { id: 'kalender', namn: 'Kalender' },
];

const RESERVDATA = [
  { id: 1, namn: 'Netflix', kostnad: 129, intervall: 'monthly', dragningsdag: 15, kategori: 'Streaming', url: 'netflix.com', aktiv: true },
  { id: 2, namn: 'Spotify', kostnad: 119, intervall: 'monthly', dragningsdag: 22, kategori: 'Musik', url: 'spotify.com', aktiv: true },
  { id: 3, namn: 'ChatGPT Plus', kostnad: 220, intervall: 'monthly', dragningsdag: 5, kategori: 'AI', url: 'chatgpt.com', aktiv: true },
  { id: 4, namn: 'Google One / iCloud', kostnad: 190, intervall: 'yearly', dragningsdag: 1, kategori: 'Moln', url: 'one.google.com', aktiv: true },
  { id: 5, namn: 'Gym / SATS', kostnad: 499, intervall: 'monthly', dragningsdag: 28, kategori: 'Sport', url: 'sats.se', aktiv: true },
];

function App() {
  const [prenumerationer, setPrenumerationer] = useState([]);
  const [laddar, setLaddar] = useState(true);
  const [offline, setOffline] = useState(false);
  const [flik, setFlik] = useState('oversikt');
  const [visaForm, setVisaForm] = useState(false);
  const [redigera, setRedigera] = useState(null);
  const [sök, setSök] = useState('');
  const [kategori, setKategori] = useState('Alla');
  const [status, setStatus] = useState('Alla');

  useEffect(() => { laddaData(); }, []);

  async function laddaData() {
    try {
      setLaddar(true);
      setPrenumerationer(await hamtaPrenumerationer());
      setOffline(false);
    } catch (err) {
      console.error(err);
      setPrenumerationer(RESERVDATA);
      setOffline(true);
    } finally {
      setLaddar(false);
    }
  }

  const handleSpara = async (data) => {
    if (redigera) {
      try {
        await uppdateraPrenumeration(redigera.id, data);
      } catch (e) {
        console.warn('Kunde inte spara mot servern, uppdaterar lokalt', e);
      }
      setPrenumerationer(prev => prev.map(p => (p.id === redigera.id ? { ...p, ...data } : p)));
    } else {
      let ny;
      try {
        ny = await skapaPrenumeration(data);
      } catch (e) {
        console.warn('Kunde inte skapa mot servern, lägger till lokalt', e);
        ny = { ...data, id: Date.now(), aktiv: true };
      }
      setPrenumerationer(prev => [...prev, ny]);
      try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); } catch {}
    }
    stängForm();
  };

  const handleToggleAktiv = (id) => {
    setPrenumerationer(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nyStatus = p.aktiv === false;
      uppdateraPrenumeration(id, { aktiv: nyStatus }).catch(() => {});
      return { ...p, aktiv: nyStatus };
    }));
  };

  const handleTaBort = async (id) => {
    if (!window.confirm('Ta bort den här prenumerationen?')) return;
    try {
      await taBortPrenumeration(id);
    } catch (e) {
      console.warn('Kunde inte ta bort mot servern, tar bort lokalt', e);
    }
    setPrenumerationer(prev => prev.filter(p => p.id !== id));
  };

  const öppnaRedigera = (p) => { setRedigera(p); setVisaForm(true); };
  const öppnaNy = () => { setRedigera(null); setVisaForm(true); };
  const stängForm = () => { setVisaForm(false); setRedigera(null); };

  const filtrerade = useMemo(() => {
    const fråga = sök.trim().toLowerCase();
    return prenumerationer.filter(p => {
      const matcharSök = !fråga
        || p.namn.toLowerCase().includes(fråga)
        || (p.url || '').toLowerCase().includes(fråga);
      const matcharKategori = kategori === 'Alla' || p.kategori === kategori;
      const matcharStatus = status === 'Alla'
        || (status === 'Aktiva' && p.aktiv !== false)
        || (status === 'Pausade' && p.aktiv === false);
      return matcharSök && matcharKategori && matcharStatus;
    });
  }, [prenumerationer, sök, kategori, status]);

  const nästaId = kommandeUppgifter(prenumerationer, 60)[0]?.id;

  const statusPills = (
    <div className="pills">
      {['Alla', 'Aktiva', 'Pausade'].map(s => (
        <button
          key={s}
          className={`pill${status === s ? ' active' : ''}`}
          onClick={() => setStatus(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );

  if (laddar) {
    return (
      <div className="loading">
        <RefreshCw size={30} className="spin" />
        <p>Laddar dina prenumerationer…</p>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark"><CreditCard size={20} /></div>
            <span className="brand-name">Prem</span>
          </div>

          <nav className="nav">
            {FLIKAR.map(f => (
              <button
                key={f.id}
                className={`nav-item${flik === f.id ? ' active' : ''}`}
                onClick={() => setFlik(f.id)}
              >
                {f.namn}
              </button>
            ))}
            <button className="btn-add" onClick={öppnaNy}>
              <Plus size={16} /> Ny
            </button>
          </nav>
        </header>

        {offline && (
          <div className="offline-note">
            <WifiOff size={16} />
            Kunde inte nå servern – visar exempeldata. Ändringar sparas inte.
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={flik}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {flik === 'oversikt' && (
              <>
                <Hero prenumerationer={prenumerationer} />
                <div className="section-head">
                  <span className="section-title">Dina tjänster</span>
                  {statusPills}
                </div>
                <SubscriptionList
                  prenumerationer={filtrerade}
                  nästaId={nästaId}
                  harNågra={prenumerationer.length > 0}
                  onEdit={öppnaRedigera}
                  onDelete={handleTaBort}
                  onToggleAktiv={handleToggleAktiv}
                  onAdd={öppnaNy}
                />
              </>
            )}

            {flik === 'tjanster' && (
              <>
                <div className="section-head">
                  <div className="filters">
                    <div className="search">
                      <Search size={17} />
                      <input
                        type="text"
                        placeholder="Sök tjänst…"
                        value={sök}
                        onChange={e => setSök(e.target.value)}
                      />
                    </div>
                    {statusPills}
                  </div>
                </div>

                <div className="pills">
                  <button
                    className={`pill${kategori === 'Alla' ? ' active' : ''}`}
                    onClick={() => setKategori('Alla')}
                  >
                    Alla {prenumerationer.length}
                  </button>
                  {KATEGORIER.map(k => {
                    const antal = prenumerationer.filter(p => p.kategori === k.namn).length;
                    if (!antal) return null;
                    return (
                      <button
                        key={k.namn}
                        className={`pill${kategori === k.namn ? ' active' : ''}`}
                        onClick={() => setKategori(k.namn)}
                      >
                        {k.emoji} {k.namn} {antal}
                      </button>
                    );
                  })}
                </div>

                <SubscriptionList
                  prenumerationer={filtrerade}
                  nästaId={nästaId}
                  harNågra={prenumerationer.length > 0}
                  onEdit={öppnaRedigera}
                  onDelete={handleTaBort}
                  onToggleAktiv={handleToggleAktiv}
                  onAdd={öppnaNy}
                />
              </>
            )}

            {flik === 'kalender' && (
              <Kalender prenumerationer={prenumerationer} onEdit={öppnaRedigera} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {visaForm && (
          <SubscriptionForm initial={redigera} onSubmit={handleSpara} onClose={stängForm} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
