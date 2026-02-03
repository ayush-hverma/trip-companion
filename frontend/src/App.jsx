import React, { useState } from 'react'
import CreateTrip from './components/CreateTrip'
import BudgetPlanner from './components/BudgetPlanner'

export default function App() {
  const [view, setView] = useState('create')
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Trip Tools</h2>
        <nav className="nav">
          <button className={`nav-btn ${view==='create' ? 'active': ''}`} onClick={() => setView('create')}>Create Trip</button>
          <button className={`nav-btn ${view==='budget' ? 'active': ''}`} onClick={() => setView('budget')}>Budget Planner</button>
        </nav>
      </aside>
      <main>
        {view === 'create' ? <CreateTrip onCreated={() => setView('budget')} /> : <BudgetPlanner />}
      </main>
    </div>
  )
}
