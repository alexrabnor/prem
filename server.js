import express from 'express';
import cors from 'cors';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3072;
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://192.168.0.155:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Directus proxy helper
async function directusFetch(path, options = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// API routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'prem' }));

app.get('/api/prenumerationer', async (req, res) => {
  try {
    // Hämtar även pausade – frontend filtrerar. Filtrerades de bort här gick en pausad
    // prenumeration inte att få tillbaka, och kalendern kunde inte visa den alls.
    const data = await directusFetch('/items/prenumerationer?sort=dragningsdag');
    res.json(data.data);
  } catch (err) {
    console.error('GET error:', err);
    res.status(err.status || 500).json({ error: 'Kunde inte hämta prenumerationer' });
  }
});

app.post('/api/prenumerationer', async (req, res) => {
  try {
    const data = await directusFetch('/items/prenumerationer', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    res.status(201).json(data.data);
  } catch (err) {
    console.error('POST error:', err);
    res.status(err.status || 500).json({ error: 'Kunde inte skapa prenumeration' });
  }
});

app.patch('/api/prenumerationer/:id', async (req, res) => {
  try {
    const data = await directusFetch(`/items/prenumerationer/${req.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(req.body),
    });
    res.json(data.data);
  } catch (err) {
    console.error('PATCH error:', err);
    res.status(err.status || 500).json({ error: 'Kunde inte uppdatera prenumeration' });
  }
});

app.delete('/api/prenumerationer/:id', async (req, res) => {
  try {
    await directusFetch(`/items/prenumerationer/${req.params.id}`, { method: 'DELETE' });
    res.status(204).end();
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(err.status || 500).json({ error: 'Kunde inte ta bort prenumeration' });
  }
});

// Static files & SPA fallback
const distPath = join(__dirname, 'dist');

if (existsSync(distPath)) {
  // Cache & version handling
  const versionCache = new Map();
  
  function assetVersion(filename) {
    if (!versionCache.has(filename)) {
      try {
        const content = readFileSync(join(distPath, filename));
        versionCache.set(filename, crypto.createHash('md5').update(content).digest('hex').slice(0, 8));
      } catch {
        versionCache.set(filename, 'unknown');
      }
    }
    return versionCache.get(filename);
  }

  app.use(express.static(distPath, {
    setHeaders(res, filePath) {
      if (/\.(html|json)$/.test(filePath)) res.setHeader('Cache-Control', 'no-cache');
      else if (/\.(js|css)$/.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      else res.setHeader('Cache-Control', 'public, max-age=86400');
    },
  }));

  // SPA fallback
  const rawHtml = readFileSync(join(distPath, 'index.html'), 'utf8');
  const indexHtml = rawHtml.replace(/(\/[\w.-]+)\?v=__V__/g, (_, s) => `${s}?v=${assetVersion(s.slice(1))}`);

  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.type('html').send(indexHtml);
  });
}

app.listen(PORT, () => console.log(`Prem körs på port ${PORT}`));
