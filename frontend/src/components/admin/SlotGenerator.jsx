import { useState } from "react";
import { generateSlots } from "../../api/slots";
import { getTodayYmd } from "../../utils/date";

const SPORTS = [
    { label: "Padel", sport_id: 1 },
    { label: "Calcetto", sport_id: 2 },
];

export default function SlotGenerator({ styles }) {
    const [sportId, setSportId] = useState(1);
    const [dateFrom, setDateFrom] = useState(getTodayYmd);
    const [dateTo, setDateTo] = useState(getTodayYmd);
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("23:00");
    const [slotMinutes, setSlotMinutes] = useState(60);
    const [priceCents, setPriceCents] = useState(""); // opzionale override

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    async function handleGenerate() {
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const payload = {
                sport_id: Number(sportId),
                date_from: dateFrom,
                date_to: dateTo,
                start_time: startTime,
                end_time: endTime,
                slot_minutes: Number(slotMinutes),
            };

            if (priceCents !== "") payload.price_cents = Math.round(Number(priceCents) * 100);
            const data = await generateSlots(payload);
            setResult(data);
        } catch (e) {
            setError(e?.message || "Errore durante la generazione");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={styles.formGrid}>
                <label className={styles.field}>
                    <span className={styles.label}>Sport</span>
                    <select
                        className={styles.input}
                        value={sportId}
                        onChange={(e) => setSportId(e.target.value)}
                    >
                        {SPORTS.map((s) => (
                            <option key={s.sport_id} value={s.sport_id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Durata slot (min)</span>
                    <input
                        className={styles.input}
                        type="number"
                        min="15"
                        step="15"
                        value={slotMinutes}
                        onChange={(e) => setSlotMinutes(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Da data</span>
                    <input
                        className={styles.input}
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>A data</span>
                    <input
                        className={styles.input}
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Ora inizio</span>
                    <input
                        className={styles.input}
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Ora fine</span>
                    <input
                        className={styles.input}
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Prezzo (€, opzionale)</span>
                    <input
                        className={styles.input}
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceCents}
                        onChange={(e) => setPriceCents(e.target.value)}
                        placeholder="es. 10.00"
                    />
                    <span className={styles.hint}>
                        Lascia vuoto per usare il prezzo default dello sport.
                    </span>
                </label>
            </div>

            <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={handleGenerate} disabled={loading}>
                    {loading ? "Generazione..." : "Genera slot"}
                </button>
                {error && <span className={styles.error}>{error}</span>}
            </div>

            {result && (
                <div className={styles.resultCard}>
                    <div className={styles.resultTitle}>Riepilogo generazione</div>
                    <div className={styles.resultGrid}>
                        <div>
                            <span className={styles.muted}>Sport ID</span>
                            <div className={styles.value}>{result.sport_id}</div>
                        </div>
                        <div>
                            <span className={styles.muted}>Campi</span>
                            <div className={styles.value}>{result.fields_count}</div>
                        </div>
                        <div>
                            <span className={styles.muted}>Slot creati</span>
                            <div className={styles.value}>{result.created}</div>
                        </div>
                        <div>
                            <span className={styles.muted}>Saltati (esistenti)</span>
                            <div className={styles.value}>{result.skipped}</div>
                        </div>
                        <div>
                            <span className={styles.muted}>Prezzo</span>
                            <div className={styles.value}>€{(result.price_cents / 100).toFixed(2)}</div>
                        </div>
                        <div>
                            <span className={styles.muted}>Periodo</span>
                            <div className={styles.value}>
                                {result.date_from} → {result.date_to} ({result.start_time}–{result.end_time})
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
