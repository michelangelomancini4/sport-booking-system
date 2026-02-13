import { useEffect, useState } from "react";
import { getBookings, deleteBooking } from "../../api/bookings";

export default function BookingsPanel({ styles }) {
    const [bookingsData, setBookingsData] = useState({ rows: [] });
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [bookingsError, setBookingsError] = useState("");
    const [bookingsMsg, setBookingsMsg] = useState("");

    async function loadBookings() {
        try {
            setLoadingBookings(true);
            setBookingsError("");
            setBookingsMsg("");

            const json = await getBookings();
            setBookingsData(json);
        } catch (e) {
            setBookingsError(e?.message || "Errore caricamento prenotazioni");
        } finally {
            setLoadingBookings(false);
        }
    }

    async function cancelBooking(bookingId) {
        try {
            setBookingsError("");
            setBookingsMsg("");

            await deleteBooking(bookingId);

            setBookingsMsg("Prenotazione annullata ✅");
            await loadBookings();
        } catch (e) {
            if (e?.status === 404) {
                setBookingsMsg("Booking non trovata (404).");
                return;
            }
            setBookingsError(e?.message || "Errore annullamento prenotazione");
        }
    }

    useEffect(() => {
        loadBookings();
    }, []);

    return (
        <>
            <div className={styles.actions}>
                <button className={styles.secondaryBtn} onClick={loadBookings} disabled={loadingBookings}>
                    {loadingBookings ? "Carico..." : "Ricarica prenotazioni"}
                </button>

                {bookingsMsg && <span className={styles.message}>{bookingsMsg}</span>}
                {bookingsError && <span className={styles.error}>{bookingsError}</span>}
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

                            <button className={styles.dangerBtn} onClick={() => cancelBooking(b.id_booking)}>
                                Annulla
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
