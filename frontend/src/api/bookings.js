import { api } from "./client";

export function getBookings(params = {}) {
    // in futuro: day, field_id, status...
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `/bookings?${qs}` : "/bookings";
    return api.request(url);
}

export function createBooking(payload) {
    return api.request("/bookings", { method: "POST", body: payload });
}

export function deleteBooking(id) {
    return api.request(`/bookings/${id}`, { method: "DELETE" });
}

export function getBookingById(id) {
    return api.request(`/bookings/${id}`);
}

export async function updateBooking(id, payload) {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error("Errore aggiornamento booking");
    }

    return res.json();
}