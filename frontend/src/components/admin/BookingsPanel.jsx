import { useEffect, useState } from "react";
import { getBookings, getBookingsHistory, deleteBooking } from "../../api/bookings";
import { getFields } from "../../api/fields";
import { RotateCw } from "lucide-react";
import { getTodayYmd } from "../../utils/date";
import styles from "../../pages/AdminPage.module.css";

export default function BookingsPanel({ selectedBookingId, onSelectBooking }) {
    const [bookingsData, setBookingsData] = useState({ rows: [] });
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [cancelingId, setCancelingId] = useState(null);
    const [bookingsError, setBookingsError] = useState("");
    const [bookingsMsg, setBookingsMsg] = useState("");
    const [qDebounced, setQDebounced] = useState("");

    // --- FILTRI ---
    const [day, setDay] = useState(getTodayYmd);
    const [mode, setMode] = useState("active"); // "active" | "history"
    const [fieldId, setFieldId] = useState("");
    const [q, setQ] = useState("");

    const [fields, setFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const [fieldsError, setFieldsError] = useState("");

    async function loadFields() {
        try {
            setLoadingFields(true);
            setFieldsError("");
            const data = await getFields();
            const rows = Array.isArray(data?.rows) ? data.rows : [];
            setFields([...rows].sort((a, b) => a.name.localeCompare(b.name)));
        } catch (e) {
            setFields([]);
            setFieldsError(e?.message || "Errore caricamento campi");
        } finally {
            setLoadingFields(false);
        }
    }

    useEffect(() => { loadFields(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => setQDebounced(q), 350);
        return () => clearTimeout(timer);
    }, [q]);

    async function loadBookings() {
        try {
            setLoadingBookings(true);
            setBookingsError("");
            setBookingsMsg("");

            const params = {
                day,
                q: qDebounced.trim() || undefined,
            };

            // storico non ha filtro field_id
            if (mode === "active") {
                params.field_id = fieldId ? Number(fieldId) : undefined;
                params.status = "active";
            }

            // rimuove undefined
            Object.keys(params).forEach((k) => {
                if (params[k] === undefined || params[k] === null || params[k] === "") {
                    delete params[k];
                }
            });

            const json = mode === "history"
                ? await getBookingsHistory(params)
                : await getBookings(params);

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
            setBookingsData((prev) => ({
                ...prev,
                rows: prev.rows.filter((b) => b.id_booking !== bookingId),
            }));
            setBookingsMsg("Prenotazione annullata ✅");
        } catch (e) {
            if (e?.status === 404) {
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
    }, [day, mode, fieldId, qDebounced]);

    // le righe dello storico usano id_booking_history come key
    const isHistory = mode === "history";

    return (
        <>
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>Prenotazioni</h2>
                    <p className={styles.cardSubtitle}>
                        {isHistory ? "Storico prenotazioni annullate." : "Lista prenotazioni attive."}
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
                    <span className={styles.label}>Vista</span>
                    <select
                        className={styles.input}
                        value={mode}
                        onChange={(e) => {
                            setMode(e.target.value);
                            onSelectBooking?.(null);
                            onModeChange?.(e.target.value);
                        }}
                    >
                        <option value="active">Attive</option>
                        <option value="history">Storico</option>
                    </select>
                </label>

                {/* campo visibile solo in modalità attive */}
                {!isHistory && (
                    <label className={styles.field}>
                        <span className={styles.label}>Campo</span>
                        <select
                            className={styles.input}
                            value={fieldId}
                            onChange={(e) => setFieldId(e.target.value)}
                            disabled={loadingFields}
                        >
                            <option value="">Tutti i campi</option>
                            {fields.map((field) => (
                                <option key={field.id} value={field.id}>
                                    {field.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

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

            {fieldsError && <div className={styles.error}>{fieldsError}</div>}
            {bookingsError && <div className={styles.error}>{bookingsError}</div>}
            {bookingsMsg && <div className={styles.success}>{bookingsMsg}</div>}

            {bookingsData?.rows?.length === 0 ? (
                <div className={styles.placeholder}>Nessuna prenotazione.</div>
            ) : (
                <ul className={styles.bookingList}>
                    {bookingsData.rows.map((b) => {
                        const now = new Date();
                        const start = new Date(b.starts_at);
                        const end = new Date(b.ends_at);
                        const isNow = !isHistory && now >= start && now < end;

                        // in storico usiamo id_booking_history, in attive id_booking
                        const rowId = isHistory ? b.id_booking_history : b.id_booking;
                        const bookingId = isHistory ? b.booking_id : b.id_booking;

                        return (
                            <li
                                key={rowId}
                                className={`${styles.bookingItem} ${isHistory ? styles.bookingCancelled : ""} ${isNow ? styles.bookingNow : ""} ${selectedBookingId === bookingId ? styles.bookingSelected : ""}`}
                                onClick={() => !isHistory && onSelectBooking?.(bookingId)}
                            >
                                <div className={styles.bookingMain}>
                                    <div className={styles.bookingTitle}>
                                        <b>{b.field_name}</b> — {b.full_name}
                                        <span className={`${styles.statusBadge} ${isHistory ? styles.cancelled : styles.active}`}>
                                            {isHistory ? "ANNULLATA" : "ATTIVA"}
                                        </span>
                                        {isNow && <span className={styles.nowBadge}>IN CORSO</span>}
                                    </div>

                                    <div className={styles.bookingMeta}>🏷️ {b.sport_name}</div>
                                    <div className={styles.bookingMeta}>📞 {b.phone || "—"}</div>
                                    <div className={styles.bookingMeta}>👥 {b.players_count} giocatori</div>
                                    <div className={styles.bookingMeta}>
                                        {new Date(b.starts_at).toLocaleString("it-IT")} →{" "}
                                        {new Date(b.ends_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                                    </div>

                                    {isHistory && b.archived_at && (
                                        <div className={styles.bookingMeta}>
                                            🗑️ Annullata il {new Date(b.archived_at).toLocaleString("it-IT")}
                                        </div>
                                    )}

                                    {b.notes && <div className={styles.bookingMeta}>📝 {b.notes}</div>}
                                </div>

                                {!isHistory && (
                                    <button
                                        className={styles.dangerBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cancelBooking(b.id_booking);
                                        }}
                                    >
                                        Annulla
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}