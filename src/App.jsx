import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Dashboard from './components/Dashboard';
import SubscriptionList from './components/SubscriptionList';
import SubscriptionForm from './components/SubscriptionForm';
import { hamtaPrenumerationer, skapaPrenumeration, uppdateraPrenumeration, taBortPrenumeration } from './api';
import { KATEGORIER } from './utils';
import { CreditCard, Plus, Search, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';

function App() {
  const [prenumerationer, setPrenumerationer] = useState([]);
  const [visaForm, setVisaForm] = useState(false);
  const [redigera, setRedigera] = useState(null);
  const [laddar, setLaddar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Alla');

  useEffect(() => {
    laddaData();
  }, []);

  const laddaData = async () => {
    try {
      setLaddar(true);
      const data = await hamtaPrenumerationer();
      setPrenumerationer(data);
    } catch (err) {
      console.error(err);
      // Fallback data for preview/development if API fails
      setPrenumerationer([
        { id: 1, namn: 'Netflix', kostnad: 129, intervall: 'monthly', dragningsdag: 15, kategori: 'Streaming', url: 'netflix.com', aktiv: true },
        { id: 2, namn: 'Spotify', kostnad: 119, intervall: 'monthly', dragningsdag: 22, kategori: 'Musik', url: 'spotify.com', aktiv: true },
        { id: 3, namn: 'ChatGPT Plus', kostnad: 220, intervall: 'monthly', dragningsdag: 5, kategori: 'AI', url: 'chatgpt.com', aktiv: true },
        { id: 4, namn: 'Google One / iCloud', kostnad: 190, intervall: 'yearly', dragningsdag: 1, kategori: 'Moln', url: 'one.google.com', aktiv: true },
        { id: 5, namn: 'Gym / SATS', kostnad: 499, intervall: 'monthly', dragningsdag: 28, kategori: 'Sport', url: 'sats.se', aktiv: true }
      ]);
    } finally {
      setLaddar(false);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleSpara = async (data) => {
    try {
      if (redigera) {
        try {
          await uppdateraPrenumeration(redigera.id, data);
        } catch(e) {
          console.warn("API update failed, updating local state", e);
        }
        setPrenumerationer(prev => prev.map(p => p.id === redigera.id ? { ...p, ...data } : p));
      } else {
        let ny;
        try {
          ny = await skapaPrenumeration(data);
        } catch(e) {
          console.warn("API create failed, adding to local state", e);
          ny = { ...data, id: Date.now(), aktiv: true };
        }
        setPrenumerationer(prev => [...prev, ny]);
        triggerConfetti();
      }
      stangForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAktiv = (id) => {
    setPrenumerationer(prev => prev.map(p => {
      if (p.id === id) {
        const nyStatus = p.aktiv === false ? true : false;
        uppdateraPrenumeration(id, { ...p, aktiv: nyStatus }).catch(() => {});
        return { ...p, aktiv: nyStatus };
      }
      return p;
    }));
  };

  const handleTaBort = async (id) => {
    if (window.confirm('Är du säker på att du vill ta bort denna prenumeration?')) {
      try {
        try {
          await taBortPrenumeration(id);
        } catch(e) {
          console.warn("API delete failed, removing from local state", e);
        }
        setPrenumerationer(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const oppnaRedigera = (prenumeration) => {
    setRedigera(prenumeration);
    setVisaForm(true);
  };

  const stangForm = () => {
    setVisaForm(false);
    setRedigera(null);
  };

  // Filtered subscriptions based on search & category chip
  const filtreradePrenumerationer = prenumerationer.filter(p => {
    const matcharSok = p.namn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (p.url && p.url.toLowerCase().includes(searchQuery.toLowerCase()));
    const matcharKategori = selectedKategori === 'Alla' || p.kategori === selectedKategori;
    return matcharSok && matcharKategori;
  });

  if (laddar) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px' }}>
        <RefreshCw size={32} className="animate-spin text-amber-500" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Laddar dina prenumerationer...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Top Header */}
      <motion.header 
        className="glass"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-group">
          <div className="logo-icon">
            <CreditCard size={24} />
          </div>
          <div className="logo-text">
            <h1>Prem</h1>
            <p>Prenumerationskollen</p>
          </div>
        </div>

        <button className="btn" onClick={() => setVisaForm(true)}>
          <Plus size={18} /> Lägg till
        </button>
      </motion.header>

      {/* Stats Dashboard */}
      <Dashboard prenumerationer={prenumerationer} />

      {/* Controls Bar: Search & Category Chips */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Sök prenumeration..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-chips">
          <button 
            className={`chip ${selectedKategori === 'Alla' ? 'active' : ''}`}
            onClick={() => setSelectedKategori('Alla')}
          >
            Alla ({prenumerationer.length})
          </button>
          {KATEGORIER.map(k => {
            const count = prenumerationer.filter(p => p.kategori === k.namn).length;
            if (count === 0) return null;
            return (
              <button 
                key={k.namn}
                className={`chip ${selectedKategori === k.namn ? 'active' : ''}`}
                onClick={() => setSelectedKategori(k.namn)}
              >
                {k.emoji} {k.namn} ({count})
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Subscriptions List */}
      <SubscriptionList 
        prenumerationer={filtreradePrenumerationer} 
        onEdit={oppnaRedigera} 
        onDelete={handleTaBort}
        onToggleAktiv={handleToggleAktiv}
      />

      {/* Modal Form */}
      <AnimatePresence>
        {visaForm && (
          <SubscriptionForm 
            initial={redigera} 
            onSubmit={handleSpara} 
            onClose={stangForm} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
