// src/pages/LoginPage.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { loginRequest } from "../api/auth"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        // e.preventDefault() blocca il comportamento default del form
        // che sarebbe ricaricare la pagina — in React gestiamo tutto noi

        setError(null)
        setLoading(true)

        try {
            const data = await loginRequest(username, password)
            login(data.access_token) // salva il token nel context + localStorage
            navigate("/admin")       // redirect alla dashboard
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 1rem" }}>
            <h1>Accesso Admin</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        style={{ display: "block", width: "100%", marginTop: 4 }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        style={{ display: "block", width: "100%", marginTop: 4 }}
                    />
                </div>

                {/* Mostra l'errore solo se esiste */}
                {error && (
                    <p style={{ color: "red", marginBottom: "1rem" }}>
                        {error}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Accesso in corso..." : "Accedi"}
                </button>
            </form>
        </div>
    )
}