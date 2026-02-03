const express = require('express');
const router = express.Router();
const Trip = require('../models/trip');

// Create trip
router.post('/', async (req, res) => {
  try {
    const { name, currency, budget, people } = req.body;
    if (!name || !currency || budget == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const trip = new Trip({ name, currency, budget, people: people || [] });
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Calculate split for a trip
router.post('/:id/split', async (req, res) => {
  try {
    const { type, data } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const people = trip.people || [];
    const budget = Number(trip.budget) || 0;

    function round2(n){ return Math.round(n * 100) / 100; }

    let allocations = [];

    if (type === 'equal') {
      if (people.length === 0) return res.status(400).json({ error: 'No people to split among' });
      const base = Math.floor((budget / people.length) * 100) / 100;
      let rem = round2(budget - base * people.length);
      allocations = people.map((p, idx) => {
        const extra = (idx === people.length - 1) ? rem : 0;
        return { person: p.name, amount: round2(base + extra) };
      });
      return res.json({ allocations });
    }

    if (type === 'percentage') {
      const percentages = (data && data.percentages) || [];
      if (percentages.length !== people.length) return res.status(400).json({ error: 'Percentages length must match people count' });
      const sum = percentages.reduce((s, v) => s + Number(v || 0), 0);
      if (Math.abs(sum - 100) > 0.01) return res.status(400).json({ error: 'Percentages must sum to 100' });
      allocations = people.map((p, idx) => ({ person: p.name, amount: round2(budget * (Number(percentages[idx]) / 100)) }));
      return res.json({ allocations });
    }

    if (type === 'unequal') {
      const amounts = (data && data.amounts) || [];
      if (amounts.length !== people.length) return res.status(400).json({ error: 'Amounts length must match people count' });
      const sum = amounts.reduce((s, v) => s + Number(v || 0), 0);
      const diff = round2(budget - sum);
      allocations = people.map((p, idx) => ({ person: p.name, amount: round2(Number(amounts[idx] || 0)) }));
      return res.json({ allocations, difference: diff });
    }

    res.status(400).json({ error: 'Unknown split type' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add an expense to a trip
router.post('/:id/expenses', async (req, res) => {
  try {
    const { payer, amount, description } = req.body;
    if (!payer || amount == null) return res.status(400).json({ error: 'Missing payer or amount' });
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    trip.expenses = trip.expenses || [];
    trip.expenses.push({ payer, amount: Number(amount), description });
    await trip.save();
    res.status(201).json({ success: true, expense: trip.expenses[trip.expenses.length - 1] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get balance sheet and suggested minimal settlements
router.get('/:id/summary', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const people = (trip.people || []).map(p => p.name);
    if (people.length === 0) return res.status(400).json({ error: 'No people in trip' });

    // initialize maps
    const paid = {};
    const owed = {};
    people.forEach(name => { paid[name] = 0; owed[name] = 0; });

    (trip.expenses || []).forEach(exp => {
      const amt = Number(exp.amount) || 0;
      if (!people.includes(exp.payer)) {
        // ignore expenses from non-members
        return;
      }
      paid[exp.payer] += amt;
      const share = amt / people.length;
      people.forEach(name => { owed[name] += share; });
    });

    const peopleSummary = people.map(name => {
      const p = { name, paid: Math.round(paid[name] * 100) / 100, owed: Math.round(owed[name] * 100) / 100 };
      p.net = Math.round((p.paid - p.owed) * 100) / 100;
      return p;
    });

    // compute minimal settlements (greedy)
    const creditors = [];
    const debtors = [];
    peopleSummary.forEach(p => {
      if (p.net > 0.001) creditors.push({ name: p.name, amt: p.net });
      else if (p.net < -0.001) debtors.push({ name: p.name, amt: p.net });
    });

    creditors.sort((a,b) => b.amt - a.amt);
    debtors.sort((a,b) => a.amt - b.amt); // most negative first

    const settlements = [];
    let i = 0, j = 0;
    function round2(n){ return Math.round(n * 100) / 100; }
    while (i < creditors.length && j < debtors.length) {
      const cred = creditors[i];
      const debt = debtors[j];
      const transfer = Math.min(cred.amt, Math.abs(debt.amt));
      if (transfer <= 0) break;
      settlements.push({ from: debt.name, to: cred.name, amount: round2(transfer) });
      cred.amt = round2(cred.amt - transfer);
      debt.amt = round2(debt.amt + transfer);
      if (Math.abs(cred.amt) < 0.001) i++;
      if (Math.abs(debt.amt) < 0.001) j++;
    }

    res.json({ people: peopleSummary, settlements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Plan budget for a trip using Gemini (or local fallback)
router.post('/:id/plan', async (req, res) => {
  try {
    const { totalBudget, startDate, endDate, categories } = req.body; // categories: [{ name, amount? or percent? }]
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const budget = Number(totalBudget || trip.budget || 0);
    if (!budget || isNaN(budget)) return res.status(400).json({ error: 'Invalid totalBudget' });

    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;
    let days = 1;
    if (s && e && !isNaN(s) && !isNaN(e)) {
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
      days = diff > 0 ? diff : 1;
    }

    // process categories: accept percent or amount. If sum of percents = ~100, compute amounts.
    let processed = [];
    if (Array.isArray(categories)) {
      const percents = categories.map(c => c.percent != null ? Number(c.percent) : null);
      const hasPercents = percents.some(p => p != null);
      if (hasPercents) {
        const sum = percents.reduce((s, v) => s + (v || 0), 0);
        if (Math.abs(sum - 100) < 0.5) {
          processed = categories.map(c => ({ name: c.name, amount: Math.round((budget * (Number(c.percent || 0) / 100)) * 100) / 100 }));
        } else {
          // if percents present but don't sum to 100, normalize
          const normalized = percents.map(p => (Number(p || 0) / (sum || 1)));
          processed = categories.map((c, i) => ({ name: c.name, amount: Math.round((budget * normalized[i]) * 100) / 100 }));
        }
      } else {
        // use explicit amounts, scale if sum != budget
        const amounts = categories.map(c => Number(c.amount || 0));
        const sumA = amounts.reduce((s, v) => s + v, 0);
        if (Math.abs(sumA - budget) > 0.01 && sumA > 0) {
          const factor = budget / sumA;
          processed = categories.map((c, i) => ({ name: c.name, amount: Math.round((amounts[i] * factor) * 100) / 100 }));
        } else {
          processed = categories.map((c, i) => ({ name: c.name, amount: Math.round((amounts[i]) * 100) / 100 }));
        }
      }
    }

    const perDay = Math.round((budget / days) * 100) / 100;
    let allocatedSum = processed.reduce((s, c) => s + (c.amount || 0), 0);

    // If categories exist but all amounts are zero (user didn't enter amounts),
    // distribute budget equally among categories with cent-accurate rounding
    // so the allocated amounts sum exactly to the budget.
    if (processed.length > 0 && Math.abs(allocatedSum) < 0.01) {
      const n = processed.length;
      const totalCents = Math.round(budget * 100);
      const baseCents = Math.floor(totalCents / n);
      let remainder = totalCents - baseCents * n; // distribute +1 cent to 'remainder' entries
      const newProcessed = processed.map((c) => {
        const add = remainder > 0 ? 1 : 0;
        if (remainder > 0) remainder -= 1;
        const amount = (baseCents + add) / 100;
        return { name: c.name || 'category', amount };
      });
      processed = newProcessed;
      allocatedSum = processed.reduce((s, c) => s + (c.amount || 0), 0);
    }

    const diff = Math.round((budget - allocatedSum) * 100) / 100;
    const alerts = [];
    if (diff < -0.01) alerts.push('Allocated categories exceed total budget');
    if (diff > 0.01) alerts.push('Some budget unallocated');

    // AI suggestion block: use GEMINI_API_KEY and GEMINI_API_URL if configured
    let aiSuggestion = null;
    const key = process.env.GEMINI_API_KEY;
    const giUrl = process.env.GEMINI_API_URL;
    if (!key || !giUrl) {
      aiSuggestion = 'AI not configured (set GEMINI_API_KEY and GEMINI_API_URL in .env)';
    } else {
      try {
        const promptLines = [];
        promptLines.push(`Trip: ${trip.name}`);
        promptLines.push(`Total budget: ${budget}`);
        if (s && e) promptLines.push(`Dates: ${s.toISOString().slice(0,10)} to ${e.toISOString().slice(0,10)} (${days} days)`);
        if (processed.length) {
          promptLines.push('Categories:');
          processed.forEach(c => promptLines.push(`- ${c.name}: ${c.amount}`));
        }
        promptLines.push('Provide a concise per-day budget, recommended daily limits per category, and mention over/under budget alerts if any. Output as plain text.');
        const prompt = promptLines.join('\n');

        const resp = await fetch(giUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({ prompt })
        });

        // If non-OK, try to include body text in message for debugging
        if (!resp.ok) {
          let bodyText = '';
          try { bodyText = await resp.text(); } catch (er) { bodyText = `<failed to read body: ${er}>`; }
          // Provide clearer guidance for a 404 which usually means the GEMINI_API_URL
          // is incorrect; include the fallback plan as well.
          if (resp.status === 404 && giUrl && giUrl.includes('generativelanguage.googleapis.com')) {
            aiSuggestion = `AI endpoint returned 404. Ensure GEMINI_API_URL is set to the correct Google Generative endpoint, e.g. https://generativelanguage.googleapis.com/v1beta2/models/gemini-2.0:generate`;
          } else {
            aiSuggestion = `AI request failed: status=${resp.status} body=${bodyText}`;
          }
        } else {
          // try JSON then text
          let j = null;
          try { j = await resp.json(); } catch (_) { /* ignore */ }
          if (j) aiSuggestion = j.output || j.text || j.result || JSON.stringify(j);
          else {
            try { aiSuggestion = await resp.text(); } catch (er) { aiSuggestion = `AI returned non-JSON: ${String(er)}`; }
          }
        }
      } catch (e) {
        aiSuggestion = `AI request error: ${String(e)}`;
      }
    }

    // If AI failed or was not configured, provide a local fallback suggestion so
    // the frontend still gets a useful plan summary.
    if (!aiSuggestion || aiSuggestion.toLowerCase().startsWith('ai request failed') || aiSuggestion.toLowerCase().startsWith('ai request error') || aiSuggestion.includes('not configured')) {
      const lines = [];
      lines.push(`Per-day budget: ${perDay} over ${days} days`);
      if (processed.length) {
        lines.push('Category allocations:');
        processed.forEach(c => lines.push(`- ${c.name || 'category'}: ${c.amount}`));
      }
      if (alerts.length) {
        lines.push('Alerts:');
        alerts.forEach(a => lines.push(`- ${a}`));
      }
      const localFallback = lines.join('\n');
      aiSuggestion = (aiSuggestion ? aiSuggestion + ' | ' : '') + 'Fallback suggestion:\n' + localFallback;
    }

    res.json({ perDayBudget: perDay, days, categories: processed, allocatedSum, difference: diff, alerts, aiSuggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
