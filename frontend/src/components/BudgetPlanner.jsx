import React, { useEffect, useState } from 'react'
import { api } from '../api'
import Modal from './Modal'

function TripCard({ trip, onPlan }){
  return (
    <div className="card">
      <div><strong>{trip.name}</strong> — {trip.currency} {trip.budget} — {trip.people.length} people</div>
      <div style={{marginTop:8}}>
        <button onClick={()=>onPlan(trip)}>Plan</button>
      </div>
    </div>
  )
}

export default function BudgetPlanner(){
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalTrip, setModalTrip] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(()=>{ load() }, [])
  async function load(){ setLoading(true); try{ const list = await api.listTrips(); setTrips(list || []); }catch(e){ console.error(e) } setLoading(false) }

  return (
    <div>
      <h1>Budget Planner</h1>
      <div style={{marginBottom:12}}><button onClick={()=>setModalTrip(null)}>Create New Trip</button></div>
      <div id="plannedTrips">
        {loading ? 'Loading...' : trips.map(t=> <TripCard key={t._id} trip={t} onPlan={(trip)=>setModalTrip(trip)} />)}
      </div>

      {modalTrip !== undefined && (
        <Modal title={modalTrip ? `Plan ${modalTrip.name}` : 'Create & Plan Trip'} onClose={()=>setModalTrip(undefined)}>
          <PlanForm trip={modalTrip} onClose={()=>{ setModalTrip(undefined); load(); }} onResult={r=>setResult(r)} />
        </Modal>
      )}

      {result && <pre style={{whiteSpace:'pre-wrap', marginTop:12}}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}

function PlanForm({ trip, onClose, onResult }){
  const [name, setName] = useState(trip ? trip.name : '')
  const [currency, setCurrency] = useState(trip ? trip.currency : 'USD')
  const [people, setPeople] = useState(trip ? trip.people.map(p=>p.name) : [])
  const [personName, setPersonName] = useState('')
  const [total, setTotal] = useState(trip ? trip.budget : '')
  const [cats, setCats] = useState([])
  const [working, setWorking] = useState(false)

  function addCat(){ setCats(c=>[...c, {name:'', val:''}]) }
  function removeCat(i){ setCats(c=>c.filter((_,idx)=>idx!==i)) }

  async function submit(e){
    e.preventDefault(); setWorking(true)
    try{
      let tripId = trip ? trip._id : null
      if (!tripId){ const created = await api.createTrip({ name: name.trim(), currency, budget: Number(total||0), people: people.map(n=>({name:n})) }); tripId = created._id }
      const payload = { totalBudget: Number(total||0), startDate: '', endDate: '', categories: cats.map(c=>({ name: c.name, amount: c.val })) }
      const plan = await api.planTrip(tripId, payload)
      onResult(plan)
    }catch(err){ onResult({ error: String(err) }) }
    setWorking(false)
  }

  return (
    <form onSubmit={submit}>
      <label>Name<input value={name} onChange={e=>setName(e.target.value)} /></label>
      <label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value)}><option>USD</option><option>EUR</option><option>INR</option></select></label>
      <label>People
        <div style={{display:'flex',gap:8}}>
          <input value={personName} onChange={e=>setPersonName(e.target.value)} placeholder="person name" />
          <button type="button" onClick={()=>{ if(!personName.trim())return; setPeople(p=>[...p, personName.trim()]); setPersonName('') }}>Add</button>
        </div>
      </label>
      <div className="people-list">{people.map((p,i)=>(<div key={i} className="person">{p}<button type="button" onClick={()=>setPeople(ps=>ps.filter((_,idx)=>idx!==i))}>Remove</button></div>))}</div>
      <label>Total<input type="number" value={total} onChange={e=>setTotal(e.target.value)} /></label>

      <div>
        <strong>Categories</strong>
        <div className="cat-list">
          {cats.map((c,i)=>(
            <div key={i} className="flex">
              <input placeholder="category" value={c.name} onChange={e=>setCats(cs=>{ const copy=[...cs]; copy[i].name = e.target.value; return copy })} />
              <input placeholder="percent or amount" value={c.val} onChange={e=>setCats(cs=>{ const copy=[...cs]; copy[i].val = e.target.value; return copy })} />
              <button type="button" onClick={()=>removeCat(i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addCat}>Add category</button>
      </div>

      <div style={{display:'flex',gap:8,marginTop:12}}>
        <button type="submit" disabled={working}>Compute with AI</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </form>
  )
}
