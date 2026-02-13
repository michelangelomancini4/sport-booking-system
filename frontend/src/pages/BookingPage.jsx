import { useEffect, useMemo, useState } from "react";
import styles from "./BookingPage.module.css";

const API_BASE = "http://127.0.0.1:8000";

/**
 * Mapping “stabile” sport -> sport_id (come in tabella sports del DB).
 
 */
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
    const [day, setDay] = useState("2026-01-23");
    const [selectedFieldId, setSelectedFieldId] = useState(""); // "" = tutti i campi
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const sportLabel = SPORTS.find((s) => s.key === sport)?.label ?? sport;




    // --- Form di prenotazione (demo) ---
    const [playersCount, setPlayersCount] = useState(4);
    const [notes, setNotes] = useState("");

    // --- Dati runtime: campi e slot dal backend ---
    const [fields, setFields] = useState([]); // [{id, name}]
    const [loadingFields, setLoadingFields] = useState(false);
    const [fieldsError, setFieldsError] = useState("");

    const [slots, setSlots] = useState([]); // [{id, start, end, ...}]
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    // sportId deriva dalla scelta sport (serve per query API)
    const sportId = SPORT_TO_SPORT_ID[sport] ?? null;

    /**
     * 1) FETCH FIELDS (STRUTTURALI)
   
     */
    async function fetchFields(signal) {
        setLoadingFields(true);
        setFieldsError("");

        try {
            const qs = new URLSearchParams();
            if (sportId) qs.set("sport_id", String(sportId));

            const res = await fetch(`${API_BASE}/fields?${qs.toString()}`, { signal });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Errore GET fields (${res.status})`);
            }

            const data = await res.json();
            const rows = Array.isArray(data?.rows) ? data.rows : [];

            const nextFields = rows
                .map((f) => ({ id: f.id, name: f.name }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setFields(nextFields);
        } catch (e) {
            // Se è abort, non segnare errore né resettare (evita flicker)
            if (e?.name === "AbortError") return;
            setFields([]);
            setFieldsError(e?.message || "Errore caricamento campi");
        } finally {
            setLoadingFields(false);
        }
    }


    /**
     * 2) FETCH SLOTS (OPERATIVI)
         */
    async function fetchSlots(signal) {
        setLoadingSlots(true);
        setSlotsError("");
        setSelectedSlotId(null);

        try {
            const qs = new URLSearchParams({ day });
            if (sportId) qs.set("sport_id", String(sportId));
            if (selectedFieldId) qs.set("field_id", String(selectedFieldId));

            const res = await fetch(`${API_BASE}/slots/free?${qs.toString()}`, { signal });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Errore GET slots (${res.status})`);
            }

            const data = await res.json();
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
            if (e?.name === "AbortError") return;
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
        const ac = new AbortController();

        setSelectedFieldId("");
        setSelectedSlotId(null);
        setSlots([]);

        fetchFields(ac.signal);

        return () => ac.abort();
    }, [sport]);


    useEffect(() => {
        const ac = new AbortController();

        // Guardia: se ho un field selezionato ma non è tra i fields correnti, non chiamare
        if (
            selectedFieldId &&
            !fields.some((f) => String(f.id) === String(selectedFieldId))
        ) {
            return () => ac.abort();
        }

        fetchSlots(ac.signal);

        return () => ac.abort();
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

    const canConfirm = Boolean(day && selectedSlot && !loadingSlots);

    /**
     * Conferma: POST /bookings
     * (demo: customer_id fisso = 1)
     */
    async function handleConfirm() {
        if (!canConfirm) return;

        try {
            const payload = {
                slot_id: selectedSlot.id,
                customer_id: 1,
                players_count: Number(playersCount) || 0,
                notes: notes || "",
            };

            const res = await fetch(`${API_BASE}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.status === 409) {
                alert("Slot già prenotato.");
                await fetchSlots();
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Errore POST booking (${res.status})`);
            }

            const data = await res.json();
            alert(`Prenotazione confermata! ID: ${data?.booking?.id_booking ?? "OK"}`);

            setNotes("");
            setSelectedSlotId(null);
            await fetchSlots();
        } catch (e) {
            alert(e?.message || "Errore durante la prenotazione");
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

                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            title={!canConfirm ? "Seleziona uno slot" : "Conferma"}
                        >
                            Conferma prenotazione
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
