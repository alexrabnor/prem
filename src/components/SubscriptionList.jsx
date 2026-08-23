import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formateraPris, getFaviconUrl, getKategori } from '../utils';
import { Edit2, Trash2, Power, ExternalLink } from 'lucide-react';

function SubscriptionList({ prenumerationer, onEdit, onDelete, onToggleAktiv }) {
  if (!prenumerationer || prenumerationer.length === 0) {
    return (
      <div className="glass empty-state">
        <div className="icon">💳</div>
        <h3 className="font-bold text-lg">Inga prenumerationer än</h3>
        <p className="text-sm text-muted">Klicka på "+ Lägg till" i menyn ovan för att lägga in dina tjänster.</p>
      </div>
    );
  }

  // Gruppera efter kategori
  const grupperade = prenumerationer.reduce((acc, p) => {
    const k = p.kategori || 'Övrigt';
    if (!acc[k]) acc[k] = [];
    acc[k].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {Object.entries(grupperade).map(([kategoriNamn, lista]) => {
          const kategoriInfo = getKategori(kategoriNamn);
          const sumKategori = lista
            .filter(p => p.aktiv !== false)
            .reduce((sum, p) => sum + (p.intervall === 'yearly' ? p.kostnad / 12 : p.kostnad), 0);
          
          return (
            <motion.div 
              key={kategoriNamn} 
              className="list-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2>{kategoriInfo.emoji} {kategoriNamn}</h2>
                <span className="text-xs text-muted font-mono font-semibold">
                  Totalt: {formateraPris(sumKategori)}/mån
                </span>
              </div>

              <div className="subscription-grid">
                {lista.map(p => {
                  const favicon = getFaviconUrl(p.url);
                  const isAktiv = p.aktiv !== false;

                  return (
                    <motion.div 
                      key={p.id} 
                      className={`subscription-card glass ${!isAktiv ? 'paused' : ''}`}
                      layout
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="sub-icon">
                        {favicon ? (
                          <img 
                            src={favicon} 
                            alt="" 
                            onError={(e) => { 
                              e.target.style.display = 'none'; 
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline'; 
                            }} 
                          />
                        ) : null}
                        <span style={{ display: favicon ? 'none' : 'inline' }}>{kategoriInfo.emoji}</span>
                      </div>
                      
                      <div className="sub-info">
                        <div className="sub-name">
                          {p.namn}
                          {!isAktiv && <span className="text-xs text-muted font-normal ml-2">(Pausad)</span>}
                        </div>
                        <div className="sub-details">
                          <span className="badge" style={{ backgroundColor: kategoriInfo.färg }}>
                            {kategoriNamn}
                          </span>
                          <span>Dras d. {p.dragningsdag}:e</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="sub-cost">
                          {formateraPris(p.kostnad)} 
                          <span className="sub-interval">{p.intervall === 'monthly' ? '/mån' : '/år'}</span>
                        </div>
                      </div>

                      <div className="sub-actions">
                        {onToggleAktiv && (
                          <button 
                            className={`btn-icon ${isAktiv ? 'text-emerald-400' : 'text-zinc-600'}`} 
                            onClick={() => onToggleAktiv(p.id)} 
                            title={isAktiv ? 'Pausa prenumeration' : 'Aktivera prenumeration'}
                          >
                            <Power size={16} />
                          </button>
                        )}
                        <button className="btn-icon" onClick={() => onEdit(p)} title="Redigera">
                          <Edit2 size={15} />
                        </button>
                        <button className="btn-icon" onClick={() => onDelete(p.id)} title="Ta bort">
                          <Trash2 size={15} className="text-rose-400" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default SubscriptionList;
