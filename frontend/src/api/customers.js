import { api } from "./client";

export function getCustomers() {
    return api.request("/customers");
}
