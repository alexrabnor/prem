import React from 'react';
import { motion } from 'framer-motion';
import { formateraPris, månadskostnad, årskostnad, kommandeUppgifter, KATEGORIER } from '../utils';
import { CreditCard, Calendar, TrendingUp, Sparkles, AlertCircle, Clock } from 'lucide-react';

function Dashboard({ prenumerationer }) {
  const aktiva = prenumerationer.filter(p => p.aktiv !== false);
  const totalMånad = aktiva.reduce((sum, p) => sum + månadskostnad(p.kostnad, p.intervall), 0);
  const totalÅr = aktiva.reduce((sum, p) => sum + årskostnad(p.kostnad, p.intervall), 0);
  
  const kommande = kommandeUppgifter(prenumerationer, 30);

  // Beräkna kostnad per kategori (månadskostnad)
  const kostnadPerKategori = {};
  KATEGORIER.forEach(k => kostnadPerKategori[k.namn] = 0);
  
  aktiva.forEach(p => {
    const k = p.kategori || 'Övrigt';
    kostnadPerKategori[k] = (kostnadPerKategori[k] || 0) + månadskostnad(p.kostnad, p.intervall);
  });

  const maxKostnad = Math.max(...Object.values(kostnadPerKategori), 1);

  return (
    <div className="dashboard-grid">
      {/* Månadskostnad */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="dashboard-card glass"
      >
        <div className="card-header">
          <h3>Månadskostnad</h3>
          <div className="card-icon">
            <CreditCard size={20} />
          </div>
        </div>
        <div className="value">{formateraPris(totalMånad)}</div>
        <div className="sub-text">
          {aktiva.length} aktiva prenumerationer
        </div>
      </motion.div>

      {/* Årskostnad */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="dashboard-card glass"
      >
        <div className="card-header">
          <h3>Totalt per år</h3>
          <div className="card-icon">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="value">{formateraPris(totalÅr)}</div>
        <div className="sub-text">
          Snitt {formateraPris(aktiva.length ? totalMånad / aktiva.length : 0)} / tjänst
        </div>
      </motion.div>

      {/* Kommande dragningar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="dashboard-card glass"
      >
        <div className="card-header">
          <h3>Kommande dragningar</h3>
          <div className="card-icon">
            <Calendar size={20} />
          </div>
        </div>
        
        {kommande.length > 0 ? (
          <div className="upcoming-list">
            {kommande.slice(0, 2).map((item) => (
              <div key={item.id} className="upcoming-item">
                <span className="font-semibold">{item.namn}</span>
                <span className="badge" style={{ backgroundColor: 'var(--accent)' }}>
                  {item.dagarKvar === 0 ? 'Idag!' : `Om ${item.dagarKvar} d`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="sub-text" style={{ marginTop: '10px' }}>Inga nära förestående dragningar</div>
        )}
      </motion.div>

      {/* Kategorigrafik */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="dashboard-card glass" 
        style={{ gridColumn: '1 / -1' }}
      >
        <div className="card-header">
          <h3>Kostnadsfördelning per kategori</h3>
          <span className="sub-text">Månadsbelopp</span>
        </div>
        
        <div className="category-bars">
          {KATEGORIER.map(kategori => {
            const belopp = kostnadPerKategori[kategori.namn] || 0;
            if (belopp === 0) return null;
            const breddProcent = Math.max((belopp / maxKostnad) * 100, 6);

            return (
              <div className="category-bar-wrapper" key={kategori.namn}>
                <div className="category-label">
                  <span>{kategori.emoji}</span>
                  <span>{kategori.namn}</span>
                </div>
                <div className="category-bar-container">
                  <motion.div 
                    className="category-bar" 
                    initial={{ width: 0 }}
                    animate={{ width: `${breddProcent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ backgroundColor: kategori.färg }}
                  ></motion.div>
                </div>
                <div className="category-amount">
                  {formateraPris(belopp)}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
