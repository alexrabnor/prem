import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KATEGORIER, PRESETS } from '../utils';
import { X, Sparkles, Check, Globe, DollarSign, Calendar } from 'lucide-react';

function SubscriptionForm({ initial, onSubmit, onClose }) {
  const [formData, setFormData] = useState(initial || {
    namn: '',
    kostnad: '',
    intervall: 'monthly',
    dragningsdag: 1,
    kategori: 'Streaming',
    url: '',
    aktiv: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePresetSelect = (preset) => {
    setFormData(prev => ({
      ...prev,
      namn: preset.namn,
      kostnad: preset.kostnad,
      intervall: preset.intervall,
      kategori: preset.kategori,
      url: preset.url
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.namn || !formData.kostnad) return;
    onSubmit({
      ...formData,
      kostnad: Number(formData.kostnad),
      dragningsdag: Number(formData.dragningsdag)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{initial ? 'Redigera prenumeration' : 'Lägg till prenumeration'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!initial && (
          <div>
            <label className="form-group label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} className="text-amber-400" /> Välj snabbval för kända tjänster:
            </label>
            <div className="presets-grid">
              {PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.namn}
                  className="preset-chip"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <span>{preset.namn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tjänstens namn *</label>
            <input 
              type="text" 
              name="namn" 
              value={formData.namn} 
              onChange={handleChange} 
              placeholder="t.ex. Netflix, Spotify" 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kostnad (SEK) *</label>
              <input 
                type="number" 
                name="kostnad" 
                value={formData.kostnad} 
                onChange={handleChange} 
                placeholder="129" 
                required 
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Intervall</label>
              <select name="intervall" value={formData.intervall} onChange={handleChange}>
                <option value="monthly">Månadsvis</option>
                <option value="yearly">Årsvis</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dragningsdag (1-31)</label>
              <input 
                type="number" 
                name="dragningsdag" 
                value={formData.dragningsdag} 
                onChange={handleChange} 
                min="1" 
                max="31" 
              />
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <select name="kategori" value={formData.kategori} onChange={handleChange}>
                {KATEGORIER.map(k => (
                  <option key={k.namn} value={k.namn}>
                    {k.emoji} {k.namn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Webbadress (för favicon/logo)</label>
            <input 
              type="text" 
              name="url" 
              value={formData.url} 
              onChange={handleChange} 
              placeholder="t.ex. netflix.com" 
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input 
              type="checkbox" 
              id="aktiv" 
              name="aktiv" 
              checked={formData.aktiv !== false} 
              onChange={handleChange} 
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            <label htmlFor="aktiv" style={{ margin: 0, cursor: 'pointer' }}>
              Aktiv prenumeration (beräknas i summan)
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Avbryt
            </button>
            <button type="submit" className="btn">
              {initial ? 'Spara ändringar' : 'Lägg till'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default SubscriptionForm;
