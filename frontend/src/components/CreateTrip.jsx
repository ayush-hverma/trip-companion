import React, { useState } from 'react'
import { api } from '../api'

export default function CreateTrip({ onCreated }) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [budget, setBudget] = useState('')
  const [people, setPeople] = useState([])
  const [personName, setPersonName] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e){
    e.preventDefault()
    setBusy(true)
    try{
      await api.createTrip({ name: name.trim(), currency, budget: Number(budget||0), people: people.map(n=>({name:n})) })
      setName(''); setBudget(''); setPeople([])
      if (onCreated) onCreated()
    }catch(err){ alert('Create failed') }
    setBusy(false)
  }

  return (
    <div>
      <h1>Create Trip</h1>
      <form onSubmit={submit} className="form">
        <label>Trip name
          <input value={name} onChange={e=>setName(e.target.value)} required />
        </label>
        <label>Currency
          <select value={currency} onChange={e=>setCurrency(e.target.value)}>
            <option>USD</option>
            <option>EUR</option>
            <option>INR</option>
          </select>
        </label>
        <label>Budget
          <input type="number" value={budget} onChange={e=>setBudget(e.target.value)} />
        </label>
        <label>Add person
          <div style={{display:'flex',gap:8}}>
            <input value={personName} onChange={e=>setPersonName(e.target.value)} placeholder="name" />
            <button type="button" onClick={()=>{ if(!personName.trim()) return; setPeople(p=>[...p, personName.trim()]); setPersonName('') }}>Add</button>
          </div>
        </label>
        <div className="people-list">
          {people.map((p,i)=>(
            <div key={i} className="person">
              <span>{p}</span>
              <button type="button" onClick={()=>setPeople(ps=>ps.filter((_,idx)=>idx!==i))}>Remove</button>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,marginTop:12}}>
          <button type="submit" disabled={busy}>Create Trip</button>
          <button type="button" onClick={()=>{ setName(''); setBudget(''); setPeople([]); setPersonName('')}}>Clear</button>
        </div>
      </form>
    </div>
  )
}
