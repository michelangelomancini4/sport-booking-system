import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)


export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    )

    function login(newToken) {
        localStorage.setItem("token", newToken)
        setToken(newToken)
    }

    function logout() {
        localStorage.removeItem("token")
        setToken(null)
    }

    // isAuthenticated è true se il token esiste
    const isAuthenticated = !!token
    // !! trasforma qualsiasi valore in boolean
    // !!("abc") → true  |  !!(null) → false

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth() {
    return useContext(AuthContext)
}