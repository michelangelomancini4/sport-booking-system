const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

export async function loginRequest(username, password) {
    // Il backend si aspetta form data, non JSON
    // FormData è l'oggetto nativo del browser per inviare form
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)

    const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data?.detail || "Credenziali non valide")
    }

    return data // { access_token: "...", token_type: "bearer" }
}