import './index.css' // Doit être la TOUTE PREMIÈRE ligne
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Calendar } from './pages/Calendar'
import { Documents } from './pages/Documents'
import { Contacts } from './pages/Contacts'
import { Cpca } from './pages/Cpca'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="documents" element={<Documents />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="cpca" element={<Cpca />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
)

