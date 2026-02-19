import { useEffect, useState } from "react";
import { getBookings, deleteBooking } from "../../api/bookings";

export default function BookingsPanel({ styles }) {
    const [bookingsData, setBookingsData] = useState({ rows: [] });
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [cancelingId, setCancelingId] = useState(null);

    const [bookingsError, setBookingsError] = useState("");
    const [bookingsMsg, setBookingsMsg] = useState("");

    async function loadBookings() {
        try {
            setLoadingBookings(true);
            setBookingsError("");
            setBookingsMsg("");

            const json = await getBookings(); // backend default: status=active
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
    }, []);

    return (
        <>
            <div className={styles.actions}>
                <button
                    className={styles.secondaryBtn}
                    onClick={loadBookings}
                    disabled={loadingBookings}
                >
                    {loadingBookings ? "Carico..." : "Ricarica prenotazioni"}
                </button>

                {bookingsMsg && <span className={styles.message}>{bookingsMsg}</span>}
                {bookingsError && (
                    <span className={styles.error}>{bookingsError}</span>
                )}
            </div>

            {bookingsData?.rows?.length === 0 ? (
                <div className={styles.placeholder}>Nessuna prenotazione.</div>
            ) : (
                <ul className={styles.bookingList}>
                    {bookingsData.rows.map((b) => (
                        <li key={b.id_booking} className={styles.bookingItem}>
                            <div className={styles.bookingMain}>
                                <div className={styles.bookingTitle}>
                                    <b>{b.field_name}</b> — {b.full_name}
                                </div>

                                <div className={styles.bookingMeta}>📞 {b.phone || "—"}</div>

                                <div className={styles.bookingMeta}>
                                    {new Date(b.starts_at).toLocaleString("it-IT")} →{" "}
                                    {new Date(b.ends_at).toLocaleTimeString("it-IT", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>

                            <button
                                className={styles.dangerBtn}
                                onClick={() => cancelBooking(b.id_booking)}
                                disabled={cancelingId === b.id_booking}
                                title={
                                    cancelingId === b.id_booking ? "Annullamento in corso..." : ""
                                }
                            >
                                {cancelingId === b.id_booking ? "Annullando..." : "Annulla"}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
