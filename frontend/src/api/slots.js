import { api } from "./client";

export function getFreeSlots(day) {
    return api.request(`/slots/free?day=${encodeURIComponent(day)}`);
}
