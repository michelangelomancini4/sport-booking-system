import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth()

    // Se non sei autenticato → rimanda al login
    // Se sei autenticato → mostra il componente figlio
    return isAuthenticated ? children : <Navigate to="/login" replace />
}