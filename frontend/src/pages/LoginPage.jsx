// src/pages/LoginPage.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { loginRequest } from "../api/auth"
import styles from "./LoginPage.module.css"

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
        <div className={styles.page}>
            <div className={styles.card}>

                <div className={styles.logo}>Sport<span>Booking</span></div>

                <h1 className={styles.title}>Accesso Admin</h1>
                <p className={styles.subtitle}>Inserisci le tue credenziali per continuare</p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="username" className={styles.label}>Username</label>
                        <input
                            id="username"
                            type="text"
                            className={styles.input}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="es. admin"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.btn}
                        disabled={loading}
                    >
                        {loading ? "Accesso in corso..." : "Accedi"}
                    </button>
                </form>

            </div>
        </div>
    )
}