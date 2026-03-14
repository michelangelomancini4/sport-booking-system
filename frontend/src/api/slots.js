import { api } from "./client";

export function getFreeSlots(day) {
    return api.request(`/slots/free?day=${encodeURIComponent(day)}`);
}

export function generateSlots(payload) {
    return api.request("/slots/generate", {
        method: "POST",
        body: payload,
    });
}