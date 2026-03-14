import { api } from "./client";

export function getFields(params = {}) {
    const qs = new URLSearchParams();

    if (params.sport_id != null && params.sport_id !== "") {
        qs.set("sport_id", String(params.sport_id));
    }

    const query = qs.toString();
    return api.request(`/fields${query ? `?${query}` : ""}`);
}