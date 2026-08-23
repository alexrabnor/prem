import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Power, Plus } from 'lucide-react';
import {
  formateraBelopp, formateraDagarKvar, getFaviconUrl, getKategori,
  kategoriTon, nästaDragning,
} from '../utils';

/** Favicon med emoji-reserv när tjänsten saknar url eller Google inte har någon ikon. */
export function Tjänsteikon({ url, emoji, className = 'card-icon' }) {
  const [trasig, setTrasig] = useState(false);
  const favicon = getFaviconUrl(url);

  if (!favicon || trasig) return <div className={className}>{emoji}</div>;
  return <img className={className} src={favicon} alt="" onError={() => setTrasig(true)} />;
}

function Kort({ p, framhävd, onEdit, onDelete, onToggleAktiv }) {
  const kategori = getKategori(p.kategori);
  const aktiv = p.aktiv !== false;
  const { dagarKvar } = nästaDragning(p.dragningsdag);

  return (
    <motion.div
      layout
      className={`card${framhävd ? ' is-next' : ''}${aktiv ? '' : ' is-paused'}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
    >
      <div className="card-top">
        <Tjänsteikon url={p.url} emoji={kategori.emoji} />

        {!aktiv ? (
          <span className="tag tag-paused">Pausad</span>
        ) : framhävd ? (
          <span className="tag tag-next">{formateraDagarKvar(dagarKvar)}</span>
        ) : (
          <span className="tag" style={kategoriTon(kategori.färg)}>{kategori.namn}</span>
        )}
      </div>

      <div className="card-body">
        <span className="card-name">{p.namn}</span>
        <span className="card-sub">
          {aktiv ? `Dras den ${p.dragningsdag}:e` : 'Pausad – räknas inte med'}
        </span>
      </div>

      <div className="card-foot">
        <span className="card-price">{formateraBelopp(p.kostnad)}</span>
        <span className="card-unit">kr/{p.intervall === 'yearly' ? 'år' : 'mån'}</span>

        <div className="card-actions">
          <button
            className="icon-btn"
            onClick={() => onToggleAktiv(p.id)}
            title={aktiv ? 'Pausa' : 'Aktivera'}
            aria-label={aktiv ? `Pausa ${p.namn}` : `Aktivera ${p.namn}`}
          >
            <Power size={15} />
          </button>
          <button className="icon-btn" onClick={() => onEdit(p)} title="Redigera" aria-label={`Redigera ${p.namn}`}>
            <Pencil size={15} />
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(p.id)} title="Ta bort" aria-label={`Ta bort ${p.namn}`}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SubscriptionList({ prenumerationer, nästaId, onEdit, onDelete, onToggleAktiv, onAdd, harNågra }) {
  if (!prenumerationer.length) {
    return (
      <div className="empty">
        <span className="emoji">{harNågra ? '🔍' : '💳'}</span>
        <h3>{harNågra ? 'Inget matchar filtret' : 'Inga prenumerationer än'}</h3>
        <p>
          {harNågra
            ? 'Prova att söka på något annat eller välj en annan kategori.'
            : 'Lägg till din första tjänst så räknar Prem ut vad prenumerationerna kostar dig per månad och år.'}
        </p>
        {!harNågra && (
          <button className="btn-add" style={{ marginTop: 8 }} onClick={onAdd}>
            <Plus size={16} /> Lägg till tjänst
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid">
      <AnimatePresence mode="popLayout">
        {prenumerationer.map(p => (
          <Kort
            key={p.id}
            p={p}
            framhävd={p.id === nästaId}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleAktiv={onToggleAktiv}
          />
        ))}
      </AnimatePresence>

      <button className="card-add" onClick={onAdd}>
        <span><Plus size={20} /></span>
        <b>Lägg till tjänst</b>
      </button>
    </div>
  );
}

export default SubscriptionList;
