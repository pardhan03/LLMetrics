import { Routes, Route, Link } from 'react-router-dom'

import ChatWorkspace from '../views/ChatWorkspace'
import Dashboard from '../views/Dashboard'
import Settings from '../views/Settings'

function AppRoutes() {
  return (
    <>
      <nav style={{ display: 'flex', gap: 20 }}>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat/:id" element={<ChatWorkspace />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  )
}

export default AppRoutes