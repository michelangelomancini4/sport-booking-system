import { api } from "./client";

export function getCustomers() {
    return api.request("/customers");
}

export function createCustomer(payload) {
    return api.request("/customers", {
        method: "POST",
        body: payload,
    });
}