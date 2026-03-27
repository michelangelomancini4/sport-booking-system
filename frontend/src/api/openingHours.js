import { api } from "./client";

export async function getOpeningHours() {
    return await api.request("/opening-hours");
}

export async function getTodayOpeningHours() {
    return await api.request("/opening-hours/today");
}

export async function updateOpeningHours(days) {
    return await api.request("/opening-hours", {
        method: "PUT",
        body: { days },
    });
}