import { useEffect, useMemo, useState } from "react";
import { createCustomer, getCustomerByPhone } from "../api/customers";
import { createBooking } from "../api/bookings";
import { getFields } from "../api/fields";
import { getFreeSlots } from "../api/slots";
import { getTodayYmd } from "../utils/date";
import styles from "./BookingPage.module.css";


/**
 * Mapping “stabile” sport -> sport_id (come in tabella sports del DB). */

const SPORT_TO_SPORT_ID = {
    padel: 1,
    calcetto: 2,
};

const SPORTS = [
    { key: "padel", label: "Padel" },
    { key: "calcetto", label: "Calcetto" },
];

/**
 * Helper: da datetime (stringa) torna "HH:MM"
 * Gestisce sia "2026-01-23T09:00:00" sia "2026-01-23 09:00:00"
 */
function hhmm(dateTimeString) {
    const d = new Date(dateTimeString);
    if (Number.isNaN(d.getTime())) return String(dateTimeString).slice(11, 16);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

export default function BookingPage() {
    // --- Selezioni utente (UI) ---
    const [sport, setSport] = useState("padel");
    const [day, setDay] = useState(getTodayYmd);
    const [selectedFieldId, setSelectedFieldId] = useState(""); // "" = tutti i campi
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const sportLabel = SPORTS.find((s) => s.key === sport)?.label ?? sport;

    // --- Form di prenotazione (demo) ---
    const [playersCount, setPlayersCount] = useState(4);
    const [notes, setNotes] = useState("");

    // ---client states---

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // --- Dati runtime: campi e slot dal backend ---
    const [fields, setFields] = useState([]); // [{id, name}]
    const [loadingFields, setLoadingFields] = useState(false);
    const [fieldsError, setFieldsError] = useState("");

    const [slots, setSlots] = useState([]); // [{id, start, end, ...}]
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    const [matchedCustomer, setMatchedCustomer] = useState(null);

    const [submitError, setSubmitError] = useState("");
    const [submitMsg, setSubmitMsg] = useState("");

    // sportId deriva dalla scelta sport (serve per query API)
    const sportId = SPORT_TO_SPORT_ID[sport] ?? null;

    /**
     * 1) FETCH FIELDS (STRUTTURALI)
   
     */
    async function fetchFields() {
        setLoadingFields(true);
        setFieldsError("");

        try {
            const data = await getFields({
                sport_id: sportId,
            });

            const rows = Array.isArray(data?.rows) ? data.rows : [];

            const nextFields = rows
                .map((f) => ({ id: f.id, name: f.name }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setFields(nextFields);
        } catch (e) {
            setFields([]);
            setFieldsError(e?.message || "Errore caricamento campi");
        } finally {
            setLoadingFields(false);
        }
    }


    /**
     * 2) FETCH SLOTS (OPERATIVI)
         */
    async function fetchSlots() {
        setLoadingSlots(true);
        setSlotsError("");
        setSelectedSlotId(null);


        try {
            const data = await getFreeSlots({
                day,
                sport_id: sportId,
                field_id: selectedFieldId || undefined,
            });

            const rows = Array.isArray(data?.rows) ? data.rows : [];

            const mapped = rows.map((r) => ({
                id: r.id_slots,
                start: hhmm(r.starts_at),
                end: hhmm(r.ends_at),
                price_cents: r.price_cents,
                field_id: r.field_id,
                field_name: r.field_name,
                raw: r,
            }));

            setSlots(mapped);
        } catch (e) {
            setSlots([]);
            setSlotsError(e?.message || "Errore caricamento slot");
        } finally {
            setLoadingSlots(false);
        }
    }


    /**
     * Quando cambia SPORT:
     * - resettiamo campo e slot selezionati
     * - puliamo gli slot vecchi (UX)
     * - ricarichiamo i campi strutturali di quello sport
     */
    useEffect(() => {
        setSelectedFieldId("");
        setSelectedSlotId(null);
        setSlots([]);

        fetchFields();
    }, [sport]);


    useEffect(() => {
        if (
            selectedFieldId &&
            !fields.some((f) => String(f.id) === String(selectedFieldId))
        ) {
            return;
        }

        fetchSlots();
    }, [day, sport, selectedFieldId, fields]);


    // Slot selezionato completo (per riepilogo + conferma)
    const selectedSlot = useMemo(
        () => slots.find((s) => s.id === selectedSlotId) || null,
        [slots, selectedSlotId]
    );
    const selectedFieldName =
        selectedSlot?.field_name ||
        fields.find((f) => String(f.id) === String(selectedFieldId))?.name ||
        (selectedFieldId ? `Campo #${selectedFieldId}` : "Tutti i campi");

    const selectedPrice =
        selectedSlot ? `€${(selectedSlot.price_cents / 100).toFixed(2)}` : "—";

    const canConfirm = Boolean(
        day &&
        selectedSlot &&
        !loadingSlots &&
        customerName.trim() &&
        customerPhone.trim() &&
        !submitting
    );

    async function handlePhoneBlur() {
        const phone = customerPhone.trim();

        if (!phone) {
            setMatchedCustomer(null);
            return;
        }

        try {
            const res = await getCustomerByPhone(phone);
            const customer = res?.customer;

            if (!customer) {
                setMatchedCustomer(null);
                return;
            }

            setMatchedCustomer(customer);
            setCustomerName(customer.full_name || "");
            setCustomerEmail(customer.email || "");
        } catch (e) {
            setMatchedCustomer(null);
            console.error("Errore ricerca cliente:", e);
        }
    }


    /**
 * Conferma:
 * 1) crea cliente via POST /customers
 * 2) crea booking via POST /bookings
 */
    async function handleConfirm() {
        if (!canConfirm) return;

        try {
            setSubmitting(true);
            setSubmitError("");
            setSubmitMsg("");

            let customerId = null;

            const existingRes = await getCustomerByPhone(customerPhone.trim());
            const existingCustomer = existingRes?.customer;

            if (existingCustomer) {
                customerId = existingCustomer.id;

                // opzionale: riallinea i campi al dato salvato
                setCustomerName(existingCustomer.full_name || "");
                setCustomerEmail(existingCustomer.email || "");
            } else {
                const customerRes = await createCustomer({
                    full_name: customerName.trim(),
                    phone: customerPhone.trim(),
                    email: customerEmail.trim() || null,
                });

                customerId = customerRes?.customer?.id;

                if (!customerId) {
                    throw new Error("Creazione cliente non riuscita");
                }
            }

            const bookingRes = await createBooking({
                slot_id: selectedSlot.id,
                customer_id: customerId,
                players_count: Number(playersCount) || 1,
                notes: notes.trim() || "",
            });

            setSubmitMsg(
                `Prenotazione confermata! ID: ${bookingRes?.booking?.id_booking ?? "OK"}`
            );

            setCustomerName("");
            setCustomerPhone("");
            setCustomerEmail("");
            setNotes("");
            setSelectedSlotId(null);

            await fetchSlots();
        } catch (e) {
            if (e?.status === 409) {
                setSubmitError("Slot già prenotato.");
                await fetchSlots();
                return;
            }

            setSubmitError(e?.message || "Errore durante la prenotazione");
        } finally {
            setSubmitting(false);
        }
    }
    const minPlayers = sport === "calcetto" ? 5 : 1;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Prenota</h1>
                <p className={styles.subtitle}>Scegli sport, giorno e fascia oraria.</p>
            </header>

            <div className={styles.layout}>
                <section className={styles.panel}>
                    {/* SPORT */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Sport</div>

                        <div className={styles.chips}>
                            {SPORTS.map((sp) => (
                                <button
                                    key={sp.key}
                                    type="button"
                                    className={`${styles.chip} ${sport === sp.key ? styles.chipActive : ""
                                        }`}
                                    onClick={() => setSport(sp.key)}
                                >
                                    {sp.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CAMPO (da /fields) */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Campo</div>

                        <label className={styles.label}>
                            <span className={styles.muted}>Seleziona campo (opzionale)</span>
                            <select
                                className={styles.input}
                                value={selectedFieldId}
                                onChange={(e) => setSelectedFieldId(e.target.value)}
                                disabled={loadingFields || fields.length === 0}
                            >
                                <option value="">Tutti i campi</option>
                                {fields.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* opzionale: se vuoi vedere errore campi */}
                        {fieldsError && <div className={styles.muted}>Errore campi: {fieldsError}</div>}
                    </div>

                    {/* GIORNO */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Giorno</div>

                        <label className={styles.label}>
                            <span className={styles.muted}>Seleziona data</span>
                            <input
                                className={styles.input}
                                type="date"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                            />
                        </label>
                    </div>

                    {/* SLOT */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Orari disponibili</div>

                        {loadingSlots && <div className={styles.muted}>Caricamento slot…</div>}

                        {!loadingSlots && slotsError && (
                            <div className={styles.muted}>Errore: {slotsError}</div>
                        )}

                        {!loadingSlots && !slotsError && slots.length === 0 && (
                            <div className={styles.muted}>
                                Nessuna disponibilità per la data selezionata. Prova a cambiare giorno
                                {selectedFieldId ? " o a selezionare 'Tutti i campi'." : " o campo."}
                            </div>

                        )}

                        {!loadingSlots && !slotsError && slots.length > 0 && (
                            <div className={styles.slotsGrid}>
                                {slots.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        className={`${styles.slot} ${selectedSlotId === s.id ? styles.slotActive : ""
                                            }`}
                                        onClick={() => setSelectedSlotId(s.id)}
                                    >
                                        <span className={styles.slotTime}>
                                            {s.start}–{s.end}
                                        </span>
                                        <span className={styles.slotMeta}>
                                            {s.field_name} • €{(s.price_cents / 100).toFixed(2)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DETTAGLI BOOKING */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Dettagli</div>
                        <div className={styles.row}>
                            <label className={styles.label}>
                                <span className={styles.muted}>Nome e cognome</span>
                                <input
                                    className={styles.input}
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Inserisci nome..."
                                    readOnly={Boolean(matchedCustomer)}
                                />
                            </label>

                            <label className={styles.label}>
                                <span className={styles.muted}>Telefono</span>
                                <input
                                    className={styles.input}
                                    value={customerPhone}
                                    onChange={(e) => {
                                        setCustomerPhone(e.target.value);
                                        setMatchedCustomer(null);
                                    }}
                                    onBlur={handlePhoneBlur}
                                    placeholder="Inserisci numero di telefono"
                                />

                            </label>
                            {matchedCustomer && (
                                <span className={styles.customerHint}>
                                    Cliente esistente trovato: verranno usati i dati associati a questo numero.
                                </span>
                            )}
                        </div>

                        <div className={styles.row}>
                            <label className={styles.label}>
                                <span className={styles.muted}>Email</span>
                                <input
                                    className={styles.input}
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="(opzionale)"
                                    readOnly={Boolean(matchedCustomer)}
                                />
                            </label>
                        </div>

                        <div className={styles.row}>
                            <label className={styles.label}>
                                <span className={styles.muted}>Giocatori</span>
                                <input
                                    className={styles.input}
                                    type="number"
                                    min={minPlayers}
                                    step="1"
                                    value={playersCount}
                                    onChange={(e) => setPlayersCount(e.target.value)}
                                />

                            </label>

                            <label className={styles.label}>
                                <span className={styles.muted}>Note</span>
                                <input
                                    className={styles.input}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="(opzionale)"
                                />
                            </label>
                        </div>
                    </div>
                </section>

                {/* SUMMARY */}
                <aside className={styles.summary}>
                    <div className={styles.summaryCard}>
                        <div className={styles.sectionTitle}>Riepilogo</div>

                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Sport</span>
                            <span className={styles.summaryValue}>{sportLabel}</span>
                        </div>

                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Giorno</span>
                            <span className={styles.summaryValue}>{day}</span>
                        </div>
                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Campo</span>
                            <span className={styles.summaryValue}>{selectedFieldName}</span>
                        </div>

                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Prezzo</span>
                            <span className={styles.summaryValue}>{selectedPrice}</span>
                        </div>


                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Slot</span>
                            <span className={styles.summaryValue}>
                                {selectedSlot ? `${selectedSlot.start}-${selectedSlot.end}` : "—"}
                            </span>
                        </div>

                        {submitError && (
                            <div className={styles.errorBox}>
                                {submitError}
                            </div>
                        )}

                        {submitMsg && (
                            <div className={styles.successBox}>
                                {submitMsg}
                            </div>
                        )}

                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            title={!canConfirm ? "Completa i dati e seleziona uno slot" : "Conferma"}
                        >
                            {submitting ? "Conferma in corso..." : "Conferma prenotazione"}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
