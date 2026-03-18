import { useEffect, useState } from "react";
import { getBookingById } from "../../api/bookings";
import { updateBooking } from "../../api/bookings";
import styles from "../../pages/AdminPage.module.css";

export default function BookingDetailPanel({ selectedBookingId, isHistory }) {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // editing states
    const [playersCount, setPlayersCount] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    useEffect(() => {
        if (!selectedBookingId) {
            setBooking(null);
            setPlayersCount("");
            setNotes("");
            setError("");
            return;
        }

        async function loadBookingDetail() {
            try {
                setLoading(true);
                setError("");

                const data = await getBookingById(selectedBookingId);
                setBooking(data?.booking ?? null);
                setPlayersCount(data?.booking?.players_count ?? "");
                setNotes(data?.booking?.notes ?? "");
            } catch (e) {
                setBooking(null);
                setError(e?.message || "Errore caricamento dettaglio prenotazione");
            } finally {
                setLoading(false);
            }
        }

        loadBookingDetail();
    }, [selectedBookingId]);

    async function handleSave() {
        try {
            setSaving(true);
            setSaveMsg("");

            const payload = {
                players_count: Number(playersCount),
                notes: notes
            };

            const data = await updateBooking(booking.id_booking, payload);

            setBooking(data.booking);
            setSaveMsg("Modifiche salvate ✓");

        } catch (e) {
            setSaveMsg("Errore aggiornamento");
        } finally {
            setSaving(false);
        }
    }

    if (!selectedBookingId) {
        return (
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>Dettaglio prenotazione</h2>
                        <p className={styles.cardSubtitle}>
                            Seleziona una prenotazione dalla lista per vedere i dettagli.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>Dettaglio prenotazione</h2>
                        <p className={styles.cardSubtitle}>Caricamento dettaglio...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>Dettaglio prenotazione</h2>
                    </div>
                </div>
                <div className={styles.error}>{error}</div>
            </section>
        );
    }

    if (!booking) {
        return (
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>Dettaglio prenotazione</h2>
                        <p className={styles.cardSubtitle}>Nessun dato disponibile.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>Dettaglio prenotazione</h2>
                    <p className={styles.cardSubtitle}>
                        Scheda completa della booking selezionata.
                    </p>
                </div>
            </div>

            <div className={styles.resultGrid}>
                <div>
                    <span className={styles.muted}>ID booking</span>
                    <div className={styles.value}>{booking.id_booking}</div>
                </div>

                <div>
                    <span className={styles.muted}>Status</span>
                    <div className={styles.value}>
                        {booking.status === "cancelled" ? "Annullata" : "Attiva"}
                    </div>
                </div>

                <div>
                    <span className={styles.muted}>Sport</span>
                    <div className={styles.value}>{booking.sport_name || "—"}</div>
                </div>

                <div>
                    <span className={styles.muted}>Campo</span>
                    <div className={styles.value}>{booking.field_name || "—"}</div>
                </div>

                <div>
                    <span className={styles.muted}>Cliente</span>
                    <div className={styles.value}>{booking.full_name || "—"}</div>
                </div>

                <div>
                    <span className={styles.muted}>Telefono</span>
                    <div className={styles.value}>{booking.phone || "—"}</div>
                </div>

                <div>
                    <span className={styles.muted}>Email</span>
                    <div className={styles.value}>{booking.email || "—"}</div>
                </div>



                <div>
                    <span className={styles.muted}>Inizio</span>
                    <div className={styles.value}>
                        {booking.starts_at
                            ? new Date(booking.starts_at).toLocaleString("it-IT")
                            : "—"}
                    </div>
                </div>

                <div>
                    <span className={styles.muted}>Fine</span>
                    <div className={styles.value}>
                        {booking.ends_at
                            ? new Date(booking.ends_at).toLocaleString("it-IT")
                            : "—"}
                    </div>
                </div>
            </div>
            <div className={styles.editSection}>
                <div className={styles.sectionTitleSmall}>Modifica prenotazione</div>

                <label className={styles.field}>
                    <span className={styles.muted}>Giocatori</span>
                    <input
                        className={styles.input}
                        type="number"
                        value={playersCount}
                        onChange={(e) => setPlayersCount(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.muted}>Note</span>
                    <textarea
                        className={styles.textarea}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                    />
                </label>

                <div className={styles.actions}>
                    <button
                        className={styles.primaryBtn}
                        disabled={saving}
                        onClick={handleSave}
                    >
                        {saving ? "Salvataggio..." : "Salva modifiche"}
                    </button>

                    {saveMsg && <span className={styles.message}>{saveMsg}</span>}
                </div>
            </div>
            {!isHistory && (
                <div className={styles.editSection}>
                    <div className={styles.sectionTitleSmall}>Modifica prenotazione</div>
                    {/* ... form invariato ... */}
                </div>
            )}
        </section>
    );
}