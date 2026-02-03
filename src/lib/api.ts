import { Trip } from '@/types';

const API_BASE = '/api';

export const api = {
  async listTrips(): Promise<Trip[]> {
    const r = await fetch(`${API_BASE}/trips`);
    if (!r.ok) throw new Error('Failed to load trips');
    return r.json();
  },

  async createTrip(body: {
    name: string;
    currency: string;
    budget: number;
    people: { name: string }[];
  }): Promise<Trip> {
    const r = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('Create trip failed');
    return r.json();
  },

  async deleteTrip(id: string): Promise<void> {
    const r = await fetch(`${API_BASE}/trips/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Delete trip failed');
  },

  async planTrip(
    id: string,
    body: {
      totalBudget: number;
      startDate?: string;
      endDate?: string;
      categories: { name: string; amount?: string; percent?: string }[];
    }
  ) {
    const r = await fetch(`${API_BASE}/trips/${id}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j.error || 'Plan failed');
    }
    return r.json();
  },

  async splitExpense(
    id: string,
    type: 'equal' | 'percentage' | 'unequal',
    data?: { percentages?: number[]; amounts?: number[] }
  ) {
    const r = await fetch(`${API_BASE}/trips/${id}/split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    });
    if (!r.ok) throw new Error('Split calculation failed');
    return r.json();
  },

  async getSummary(id: string) {
    const r = await fetch(`${API_BASE}/trips/${id}/summary`);
    if (!r.ok) throw new Error('Failed to get summary');
    return r.json();
  },

  async addExpense(
    id: string,
    expense: { payer: string; amount: number; description: string }
  ) {
    const r = await fetch(`${API_BASE}/trips/${id}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!r.ok) throw new Error('Failed to add expense');
    return r.json();
  },
};