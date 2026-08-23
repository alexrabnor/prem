import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { KATEGORIER, PRESETS } from '../utils';
import { Tjänsteikon } from './SubscriptionList';

const TOMT = {
  namn: '', kostnad: '', intervall: 'monthly',
  dragningsdag: 1, kategori: 'Streaming', url: '', aktiv: true,
};

function SubscriptionForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial ? { ...TOMT, ...initial } : TOMT);

  const ändra = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const väljPreset = (preset) => {
    setForm(prev => ({ ...prev, ...preset }));
  };

  const skicka = (e) => {
    e.preventDefault();
    if (!form.namn || form.kostnad === '') return;
    onSubmit({
      ...form,
      kostnad: Number(form.kostnad),
      dragningsdag: Number(form.dragningsdag),
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <motion.form
        className="modal"
        onSubmit={skicka}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      >
        <div className="modal-head">
          <h2>{initial ? 'Redigera prenumeration' : 'Lägg till prenumeration'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Stäng">
            <X size={19} />
          </button>
        </div>

        {!initial && (
          <div className="field">
            <label><Sparkles size={13} style={{ verticalAlign: -2 }} /> Snabbval</label>
            <div className="presets">
              {PRESETS.map(p => (
                <button type="button" key={p.namn} className="preset" onClick={() => väljPreset(p)}>
                  <Tjänsteikon url={p.url} emoji="📦" className="preset-icon" />
                  {p.namn}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="namn">Tjänstens namn *</label>
          <input id="namn" name="namn" value={form.namn} onChange={ändra}
                 placeholder="t.ex. Netflix" required autoFocus />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="kostnad">Kostnad (kr) *</label>
            <input id="kostnad" name="kostnad" type="number" min="0" step="1"
                   value={form.kostnad} onChange={ändra} placeholder="129" required />
          </div>
          <div className="field">
            <label htmlFor="intervall">Intervall</label>
            <select id="intervall" name="intervall" value={form.intervall} onChange={ändra}>
              <option value="monthly">Månadsvis</option>
              <option value="yearly">Årsvis</option>
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="dragningsdag">Dragningsdag</label>
            <input id="dragningsdag" name="dragningsdag" type="number" min="1" max="31"
                   value={form.dragningsdag} onChange={ändra} />
          </div>
          <div className="field">
            <label htmlFor="kategori">Kategori</label>
            <select id="kategori" name="kategori" value={form.kategori} onChange={ändra}>
              {KATEGORIER.map(k => (
                <option key={k.namn} value={k.namn}>{k.emoji} {k.namn}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="url">Webbadress <span style={{ fontWeight: 500 }}>(hämtar tjänstens ikon)</span></label>
          <input id="url" name="url" value={form.url} onChange={ändra} placeholder="netflix.com" />
        </div>

        <label className="check">
          <input type="checkbox" name="aktiv" checked={form.aktiv !== false} onChange={ändra} />
          Aktiv – räknas med i månadssumman
        </label>

        <div className="modal-foot">
          <button type="button" className="btn-ghost" onClick={onClose}>Avbryt</button>
          <button type="submit" className="btn-primary">
            {initial ? 'Spara ändringar' : 'Lägg till'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default SubscriptionForm;
