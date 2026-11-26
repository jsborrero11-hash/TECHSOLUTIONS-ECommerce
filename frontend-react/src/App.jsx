
import { AuthProvider } from './context/AuthContext.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import AppRoutes from './routes/AppRoutes'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <AppRoutes />
      </CarritoProvider>
    </AuthProvider>
  )
}

export default App
