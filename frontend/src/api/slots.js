import { api } from "./client";

export function getFreeSlots(params = {}) {
    const qs = new URLSearchParams();

    if (params.day) qs.set("day", params.day);
    if (params.sport_id != null && params.sport_id !== "") {
        qs.set("sport_id", String(params.sport_id));
    }
    if (params.field_id != null && params.field_id !== "") {
        qs.set("field_id", String(params.field_id));
    }

    const query = qs.toString();
    return api.request(`/slots/free${query ? `?${query}` : ""}`);
}

export function generateSlots(payload) {
    return api.request("/slots/generate", {
        method: "POST",
        body: payload,
    });
}