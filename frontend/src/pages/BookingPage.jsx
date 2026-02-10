import { useMemo, useState } from "react";
import styles from "./BookingPage.module.css";

const SPORTS = [
    { key: "padel", label: "Padel" },
    { key: "calcetto", label: "Calcetto" },
    { key: "tennis", label: "Tennis" },
];

const MOCK_SLOTS = [
    { id: 1, start: "09:00", end: "10:00" },
    { id: 2, start: "10:00", end: "11:00" },
    { id: 3, start: "11:00", end: "12:00" },
    { id: 4, start: "17:00", end: "18:00" },
    { id: 5, start: "18:00", end: "19:00" },
    { id: 6, start: "19:00", end: "20:00" },
];

function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function BookingPage() {
    const [sport, setSport] = useState("padel");
    const [day, setDay] = useState(todayISO());
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const selectedSlot = useMemo(
        () => MOCK_SLOTS.find((s) => s.id === selectedSlotId) || null,
        [selectedSlotId]
    );

    const canConfirm = Boolean(sport && day && selectedSlot);

    const handleConfirm = () => {
        if (!canConfirm) return;

        // in futuro qui POST /bookings
        alert(
            `Prenotazione (mock)\nSport: ${sport}\nGiorno: ${day}\nSlot: ${selectedSlot.start}-${selectedSlot.end}`
        );
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Prenota</h1>
                <p className={styles.subtitle}>
                    Scegli sport, giorno e orario. Conferma in pochi secondi.
                </p>
            </header>

            <div className={styles.layout}>
                {/* LEFT */}
                <section className={styles.panel}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Sport</h2>

                        <div className={styles.chips}>
                            {SPORTS.map((s) => (
                                <button
                                    key={s.key}
                                    type="button"
                                    className={`${styles.chip} ${sport === s.key ? styles.chipActive : ""
                                        }`}
                                    onClick={() => {
                                        setSport(s.key);
                                        setSelectedSlotId(null);
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Giorno</h2>

                        <div className={styles.row}>
                            <label className={styles.label}>
                                Seleziona data
                                <input
                                    className={styles.input}
                                    type="date"
                                    value={day}
                                    onChange={(e) => {
                                        setDay(e.target.value);
                                        setSelectedSlotId(null);
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionTitleRow}>
                            <h2 className={styles.sectionTitle}> Orario disponibile</h2>
                            <span className={styles.muted}>
                                {MOCK_SLOTS.length} slot
                            </span>
                        </div>

                        <div className={styles.slots}>
                            {MOCK_SLOTS.map((slot) => {
                                const isActive = slot.id === selectedSlotId;
                                return (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        className={`${styles.slot} ${isActive ? styles.slotActive : ""
                                            }`}
                                        onClick={() => setSelectedSlotId(slot.id)}
                                    >
                                        <span className={styles.slotTime}>
                                            {slot.start} – {slot.end}
                                        </span>
                                        <span className={styles.slotMeta}>Disponibile</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* RIGHT: summary */}
                <aside className={styles.summary}>
                    <div className={styles.summaryCard}>
                        <h3 className={styles.summaryTitle}>Riepilogo</h3>

                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Sport</span>
                            <span className={styles.summaryValue}>
                                {SPORTS.find((s) => s.key === sport)?.label ?? "-"}
                            </span>
                        </div>

                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Giorno</span>
                            <span className={styles.summaryValue}>{day || "-"}</span>
                        </div>

                        <div className={styles.summaryLine}>
                            <span className={styles.muted}>Orario</span>
                            <span className={styles.summaryValue}>
                                {selectedSlot ? `${selectedSlot.start}–${selectedSlot.end}` : "-"}
                            </span>
                        </div>

                        <button
                            type="button"
                            className={`${styles.primaryBtn} ${!canConfirm ? styles.disabled : ""
                                }`}
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                        >
                            Conferma prenotazione
                        </button>

                        <p className={styles.hint}>
                            * Per ora è mock. Dopo lo colleghiamo all’API slot + POST booking.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
