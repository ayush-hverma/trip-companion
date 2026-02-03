export const api = {
  async listTrips() {
    const r = await fetch('/api/trips');
    if (!r.ok) throw new Error('Failed to load trips');
    return r.json();
  },
  async createTrip(body) {
    const r = await fetch('/api/trips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('Create trip failed');
    return r.json();
  },
  async planTrip(id, body) {
    const r = await fetch(`/api/trips/${id}/plan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const j = await r.json().catch(()=>({})); throw new Error(j.error || 'Plan failed'); }
    return r.json();
  }
};
