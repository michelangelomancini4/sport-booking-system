import { useEffect, useState } from "react";
import { getBookings, deleteBooking } from "../../api/bookings";
import { RotateCw } from "lucide-react";

import styles from "../../pages/AdminPage.module.css";

export default function BookingsPanel({ styles }) {
    const [bookingsData, setBookingsData] = useState({ rows: [] });
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [cancelingId, setCancelingId] = useState(null);

    const [bookingsError, setBookingsError] = useState("");
    const [bookingsMsg, setBookingsMsg] = useState("");

    const [qDebounced, setQDebounced] = useState("");

    // --- FILTRI ---
    const [day, setDay] = useState("2026-01-23");
    const [status, setStatus] = useState("active");
    const [fieldId, setFieldId] = useState("");
    const [q, setQ] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setQDebounced(q);
        }, 350);

        return () => clearTimeout(timer);
    }, [q]);

    async function loadBookings() {
        try {
            setLoadingBookings(true);
            setBookingsError("");
            setBookingsMsg("");

            const params = {
                day,
                status,
                field_id: fieldId ? Number(fieldId) : undefined,
                q: qDebounced.trim() ? qDebounced.trim() : undefined,
            };

            //  rimuove chiavi con undefined/null/""
            Object.keys(params).forEach((k) => {
                if (params[k] === undefined || params[k] === null || params[k] === "") {
                    delete params[k];
                }
            });

            const json = await getBookings(params);
            setBookingsData(json);
        } catch (e) {
            setBookingsError(e?.message || "Errore caricamento prenotazioni");
        } finally {
            setLoadingBookings(false);
        }
    }
    async function cancelBooking(bookingId) {
        const ok = window.confirm("Vuoi annullare questa prenotazione?");
        if (!ok) return;

        try {
            setCancelingId(bookingId);
            setBookingsError("");
            setBookingsMsg("");

            await deleteBooking(bookingId);

            // Optimistic UI: rimuovi subito la card
            setBookingsData((prev) => ({
                ...prev,
                rows: prev.rows.filter((b) => b.id_booking !== bookingId),
            }));

            setBookingsMsg("Prenotazione annullata ✅");
            // Se vuoi “syncare” comunque col backend, sblocca:
            // await loadBookings();
        } catch (e) {
            if (e?.status === 404) {
                // Idempotente: se non esiste più, la togliamo comunque dalla UI
                setBookingsData((prev) => ({
                    ...prev,
                    rows: prev.rows.filter((b) => b.id_booking !== bookingId),
                }));
                setBookingsMsg("Booking non trovata (404).");
                return;
            }
            setBookingsError(e?.message || "Errore annullamento prenotazione");
        } finally {
            setCancelingId(null);
        }
    }

    useEffect(() => {
        loadBookings();
    }, [day, status, fieldId, qDebounced]);

    return (
        <>
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>Prenotazioni</h2>
                    <p className={styles.cardSubtitle}>
                        Lista prenotazioni e annullamento (DELETE).
                    </p>
                </div>
                <button
                    className={styles.iconBtn}
                    onClick={loadBookings}
                    disabled={loadingBookings}
                    title="Aggiorna"
                    aria-label="Aggiorna prenotazioni"
                >
                    <RotateCw className={loadingBookings ? styles.spin : ""} size={18} />
                </button>
            </div>
            <div className={styles.formGrid}>
                <label className={styles.field}>
                    <span className={styles.label}>Giorno</span>
                    <input
                        className={styles.input}
                        type="date"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Status</span>
                    <select
                        className={styles.input}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="active">Attive</option>
                        <option value="cancelled">Storico</option>
                        <option value="">Tutte</option>
                    </select>
                </label>


                <label className={styles.field}>
                    <span className={styles.label}>Campo (ID)</span>
                    <input
                        className={styles.input}
                        type="number"
                        min="1"
                        value={fieldId}
                        onChange={(e) => setFieldId(e.target.value)}
                        placeholder="opzionale"
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.label}>Cerca</span>
                    <input
                        className={styles.input}
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="nome / telefono / email"
                    />
                </label>

            </div>

            {bookingsError && (
                <div className={styles.error}>
                    {bookingsError}
                </div>
            )}

            {bookingsMsg && (
                <div className={styles.success}>
                    {bookingsMsg}
                </div>
            )}


            {bookingsData?.rows?.length === 0 ? (
                <div className={styles.placeholder}>Nessuna prenotazione.</div>
            ) : (
                <ul className={styles.bookingList}>
                    {bookingsData.rows.map((b) => (
                        <li
                            key={b.id_booking}
                            className={`${styles.bookingItem} ${b.status === "cancelled" ? styles.bookingCancelled : ""
                                }`}
                        >                            <div className={styles.bookingMain}>
                                <div className={styles.bookingTitle}>
                                    <b>{b.field_name}</b> — {b.full_name}
                                    <span
                                        className={`${styles.statusBadge} ${b.status === "cancelled" ? styles.cancelled : styles.active
                                            }`}
                                    >
                                        {b.status === "cancelled" ? "ANNULLATA" : "ATTIVA"}
                                    </span>
                                </div>

                                <div className={styles.bookingMeta}>🏷️ {b.sport_name}</div>
                                <div className={styles.bookingMeta}>📞 {b.phone || "—"}</div>
                                <div className={styles.bookingMeta}>👥 {b.players_count} giocatori</div>

                                <div className={styles.bookingMeta}>
                                    {new Date(b.starts_at).toLocaleString("it-IT")} →{" "}
                                    {new Date(b.ends_at).toLocaleTimeString("it-IT", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>

                                {b.notes && (
                                    <div className={styles.bookingMeta}>
                                        📝 {b.notes}
                                    </div>
                                )}
                            </div>

                            {b.status === "active" && (
                                <button
                                    className={styles.dangerBtn}
                                    onClick={() => cancelBooking(b.id_booking)}
                                >
                                    Annulla
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
