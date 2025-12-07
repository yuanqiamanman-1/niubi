import { Routes, Route } from 'react-router-dom'
import UserForm from './components/UserForm'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="app min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/merchant" element={<Login />} />
        <Route 
          path="/merchant/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App