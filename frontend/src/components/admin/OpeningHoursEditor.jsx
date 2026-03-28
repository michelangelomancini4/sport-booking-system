import { useEffect, useState } from "react";
import { getOpeningHours, updateOpeningHours } from "../../api/openingHours";
import styles from "../../pages/AdminPage.module.css";

const DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

export default function OpeningHoursEditor() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await getOpeningHours();
                setRows(data.rows ?? []);
            } catch (e) {
                setError("Errore caricamento orari");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function handleChange(index, field, value) {
        setRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        );
    }

    async function handleSave() {
        try {
            setSaving(true);
            setMsg("");
            setError("");

            const days = rows.map((r) => ({
                day_of_week: r.day_of_week,
                open_time: r.is_closed ? null : r.open_time,
                close_time: r.is_closed ? null : r.close_time,
                is_closed: Boolean(r.is_closed),
            }));

            await updateOpeningHours(days);
            setMsg("Orari salvati ✓");
            setTimeout(() => setMsg(""), 3000);
        } catch (e) {
            setError(e?.message || "Errore salvataggio");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className={styles.muted}>Caricamento orari...</div>;

    return (
        <>
            {rows.map((row, i) => {
                const isClosed = Boolean(row.is_closed);
                return (
                    <div key={row.day_of_week} className={styles.ohRow}>
                        <span className={styles.ohDay}>
                            {DAYS[row.day_of_week] ?? `Giorno ${row.day_of_week}`}
                        </span>

                        <input
                            className={styles.input}
                            type="time"
                            value={isClosed ? "" : (row.open_time ?? "")}
                            disabled={isClosed}
                            onChange={(e) => handleChange(i, "open_time", e.target.value)}
                        />

                        <input
                            className={styles.input}
                            type="time"
                            value={isClosed ? "" : (row.close_time ?? "")}
                            disabled={isClosed}
                            onChange={(e) => handleChange(i, "close_time", e.target.value)}
                        />

                        <label className={styles.ohToggleLabel}>
                            <input
                                className={styles.ohToggleInput}
                                type="checkbox"
                                checked={!isClosed}
                                onChange={(e) => handleChange(i, "is_closed", e.target.checked ? 0 : 1)}
                            />
                            <div className={`${styles.ohTrack} ${!isClosed ? styles.ohTrackOn : ""}`}>
                                <div className={`${styles.ohThumb} ${!isClosed ? styles.ohThumbOn : ""}`} />
                            </div>
                            <span className={styles.ohToggleText}>
                                {isClosed ? "Chiuso" : "Aperto"}
                            </span>
                        </label>
                    </div>
                );
            })}

            <div className={styles.actions}>
                <button
                    className={styles.primaryBtn}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Salvataggio..." : "Salva orari"}
                </button>
                {msg && <span className={styles.message}>{msg}</span>}
                {error && <span className={styles.error}>{error}</span>}
            </div>
        </>
    );
}