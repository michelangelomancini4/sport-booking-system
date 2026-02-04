const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request(path, { method = "GET", body, headers } = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(headers ?? {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    // prova a leggere JSON anche su errori
    let data = null;
    const isJson = res.headers.get("content-type")?.includes("application/json");
    if (isJson) data = await res.json().catch(() => null);

    if (!res.ok) {
        const message = data?.detail || data?.message || `HTTP ${res.status}`;
        const err = new Error(message);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

export const api = { request };
