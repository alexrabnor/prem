const API = '/api/prenumerationer';

export async function hamtaPrenumerationer() {
  const res = await fetch(API);
  if (!res.ok) throw new Error('Kunde inte hämta prenumerationer');
  return res.json();
}

export async function skapaPrenumeration(data) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, aktiv: true }),
  });
  if (!res.ok) throw new Error('Kunde inte skapa prenumeration');
  return res.json();
}

export async function uppdateraPrenumeration(id, data) {
  const res = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Kunde inte uppdatera');
  return res.json();
}

export async function taBortPrenumeration(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Kunde inte ta bort');
}
