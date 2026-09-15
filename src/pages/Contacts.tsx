import { memo } from 'react'

export const Contacts = memo(() => {
  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', marginBottom: '2rem' }}>
        Carnet de Contacts
      </h1>
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Annuaire local synchronisé des clients, confrères, tribunaux et experts.
      </div>
    </div>
  )
})

Contacts.displayName = 'Contacts'
