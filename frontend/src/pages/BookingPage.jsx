import { useEffect, useMemo, useState } from "react";
import styles from "./BookingPage.module.css";

const API_BASE = "http://127.0.0.1:8000";

// Demo mapping: sport -> field_id (adatta se nel DB hai id diversi)
const SPORT_TO_FIELD_ID = {
    padel: 1,
    calcetto: 2,
    tennis: 3,
};

const SPORTS = [
    { key: "padel", label: "Padel" },
    { key: "calcetto", label: "Calcetto" },
    { key: "tennis", label: "Tennis" },
];

function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function hhmm(dateTimeString) {
    // dateTimeString tipo "2026-01-23T09:00:00" o "2026-01-23 09:00:00"
    const d = new Date(dateTimeString);
    if (Number.isNaN(d.getTime())) {
        // fallback se il parsing non va: prendi substring
        return String(dateTimeString).slice(11, 16);
    }
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

export default function BookingPage() {
    const [sport, setSport] = useState("padel");
    const [day, setDay] = useState("2026-01-23"); //  data preimpostata
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    // mini-form booking (demo)
    const [playersCount, setPlayersCount] = useState(4);
    const [notes, setNotes] = useState("");

    // data dal backend
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    const fieldId = SPORT_TO_FIELD_ID[sport] ?? null;

    async function fetchSlots() {
        setLoadingSlots(true);
        setSlotsError("");
        setSelectedSlotId(null);

        try {
            const qs = new URLSearchParams({ day });
            if (fieldId) qs.set("field_id", String(fieldId));

            const res = await fetch(`${API_BASE}/slots/free?${qs.toString()}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Errore GET slots (${res.status})`);
            }

            const data = await res.json(); // { rows: [...], day: "..." }
            const rows = Array.isArray(data?.rows) ? data.rows : [];

            const mapped = rows.map((r) => ({
                id: r.id_slots,
                start: hhmm(r.starts_at),
                end: hhmm(r.ends_at),
                price_cents: r.price_cents,
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

    useEffect(() => {
        // ricarica quando cambia giorno o sport/field
        fetchSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [day, sport]);

    const selectedSlot = useMemo(
        () => slots.find((s) => s.id === selectedSlotId) || null,
        [slots, selectedSlotId]
    );

    const canConfirm = Boolean(day && selectedSlot && !loadingSlots);

    async function handleConfirm() {
        if (!canConfirm) return;

        try {
            // Demo: customer fisso (metti un cliente seedato id=1 nel DB)
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

            const data = await res.json(); // { booking: ... }
            alert(`Prenotazione confermata! ID: ${data?.booking?.id_booking ?? "OK"}`);

            setNotes("");
            setSelectedSlotId(null);
            await fetchSlots();
        } catch (e) {
            alert(e?.message || "Errore durante la prenotazione");
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Prenota</h1>
                <p className={styles.subtitle}>Scegli sport, giorno e fascia oraria.</p>
            </header>

            <div className={styles.layout}>
                <section className={styles.panel}>
                    {/* Sport */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Sport</div>

                        <div className={styles.chips}>
                            {SPORTS.map((sp) => (
                                <button
                                    key={sp.key}
                                    type="button"
                                    className={`${styles.chip} ${sport === sp.key ? styles.chipActive : ""}`}
                                    onClick={() => setSport(sp.key)}
                                >
                                    {sp.label}
                                </button>
                            ))}
                        </div>

                        {/* <div className={styles.muted}>
                            (demo) sport → field_id: <b>{fieldId ?? "—"}</b>
                        </div> */}
                    </div>

                    {/* Giorno */}
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

                    {/* Slot */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Orari disponibili</div>

                        {loadingSlots && <div className={styles.muted}>Caricamento slot…</div>}

                        {!loadingSlots && slotsError && (
                            <div className={styles.muted}>Errore: {slotsError}</div>
                        )}

                        {!loadingSlots && !slotsError && slots.length === 0 && (
                            <div className={styles.muted}>Nessuno slot disponibile per questo giorno.</div>
                        )}

                        {!loadingSlots && !slotsError && slots.length > 0 && (
                            <div className={styles.slotsGrid}>
                                {slots.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        className={`${styles.slot} ${selectedSlotId === s.id ? styles.slotActive : ""}`}
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

                    {/* Extra (demo) */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Dettagli</div>

                        <div className={styles.row}>
                            <label className={styles.label}>
                                <span className={styles.muted}>Giocatori</span>
                                <input
                                    className={styles.input}
                                    type="number"
                                    min="0"
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
                        {/* 
                        <div className={styles.muted}>
                            (demo) customer_id fisso = <b>1</b>
                        </div> */}
                    </div>
                </section>

                {/* Summary */}
                <aside className={styles.summary}>
                    <div className={styles.summaryCard}>
                        <div className={styles.sectionTitle}>Riepilogo</div>

                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Sport</span>
                            <span className={styles.summaryValue}>{sport}</span>
                        </div>

                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Giorno</span>
                            <span className={styles.summaryValue}>{day}</span>
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

                        <p className={styles.hint}>
                            {/* Nota: per ora prenota come cliente demo (id=1). Quando facciamo la pagina clienti,
                            lo rendiamo reale. */}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
