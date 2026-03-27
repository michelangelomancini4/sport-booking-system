import { useEffect, useState } from "react";
import { updateBooking } from "../../api/bookings";
import styles from "../../pages/AdminPage.module.css";

export default function BookingDetailPanel({ selectedBookingId, selectedBooking, isHistory }) {
    const [playersCount, setPlayersCount] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    const booking = selectedBooking ?? null;

    useEffect(() => {
        setPlayersCount(booking?.players_count ?? "");
        setNotes(booking?.notes ?? "");
        setSaveMsg("");
    }, [selectedBookingId]);

    async function handleSave() {
        try {
            setSaving(true);
            setSaveMsg("");
            await updateBooking(booking.id_booking, {
                players_count: Number(playersCount),
                notes: notes,
            });
            setSaveMsg("Modifiche salvate ✓");
            setTimeout(() => setSaveMsg(""), 3000);
        } catch (e) {
            setSaveMsg(e?.message || "Errore aggiornamento");
        } finally {
            setSaving(false);
        }
    }

    if (!selectedBookingId) {
        return (
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>Dettaglio prenotazione</h2>
                        <p className={styles.cardSubtitle}>
                            Seleziona una prenotazione dalla lista per vedere i dettagli.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>Dettaglio prenotazione</h2>
                        <p className={styles.cardSubtitle}>Nessun dato disponibile.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>Dettaglio prenotazione</h2>
                    <p className={styles.cardSubtitle}>Scheda completa della booking selezionata.</p>
                </div>
            </div>

            <div className={styles.resultGrid}>
                <div>
                    <span className={styles.muted}>ID booking</span>
                    <div className={styles.value}>{booking.id_booking ?? booking.booking_id}</div>
                </div>
                <div>
                    <span className={styles.muted}>Status</span>
                    <div className={styles.value}>{booking.status === "cancelled" ? "Annullata" : "Attiva"}</div>
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
                        {booking.starts_at ? new Date(booking.starts_at).toLocaleString("it-IT") : "—"}
                    </div>
                </div>
                <div>
                    <span className={styles.muted}>Fine</span>
                    <div className={styles.value}>
                        {booking.ends_at ? new Date(booking.ends_at).toLocaleString("it-IT") : "—"}
                    </div>
                </div>
                <div>
                    <span className={styles.muted}>Giocatori</span>
                    <div className={styles.value}>{booking.players_count}</div>
                </div>
                {booking.notes && (
                    <div>
                        <span className={styles.muted}>Note</span>
                        <div className={styles.value}>{booking.notes}</div>
                    </div>
                )}
                {isHistory && booking.archived_at && (
                    <div>
                        <span className={styles.muted}>Annullata il</span>
                        <div className={styles.value}>
                            {new Date(booking.archived_at).toLocaleString("it-IT")}
                        </div>
                    </div>
                )}
            </div>

            {!isHistory && (
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
            )}
        </div>
    );
}