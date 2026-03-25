import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getOpeningHours, getTodayOpeningHours } from "../api/openingHours";
import styles from "./OpeningHours.module.css";


export default function OpeningHours() {
    const [today, setToday] = useState(null);
    const [week, setWeek] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {

                const [todayData, weekData] = await Promise.all([
                    getTodayOpeningHours(),
                    getOpeningHours(),
                ]);
                setToday(todayData);
                setWeek(weekData.rows ?? []);
            } catch (e) {
                console.error("Errore caricamento orari:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading || !today) return null;

    const isClosed = Boolean(today.is_closed);

    const bannerText = isClosed
        ? null
        : `${today.open_time} – ${today.close_time}`;

    return (
        <div className={styles.wrapper}>
            <button
                className={`${styles.banner} ${isClosed ? styles.bannerClosed : styles.bannerOpen}`}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                type="button"
            >
                <div className={styles.bannerLeft}>
                    <span className={`${styles.dot} ${isClosed ? styles.dotClosed : styles.dotOpen}`} />
                    <span className={styles.bannerText}>
                        {isClosed ? (
                            <>Oggi <strong>chiuso</strong></>
                        ) : (
                            <>Oggi aperto <strong className={styles.bannerHours}>{bannerText}</strong></>
                        )}
                    </span>
                </div>
                <div className={styles.bannerRight}>
                    <span className={styles.bannerHint}>
                        {open ? "Chiudi" : "Vedi settimana"}
                    </span>

                    <ChevronDown
                        size={16}
                        className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                    />
                </div>
            </button>

            {open && (
                <div className={styles.accordion}>
                    {week.map((row) => {
                        const isToday = row.day_of_week === today.day_of_week;
                        const isClosed = Boolean(row.is_closed);
                        return (
                            <div
                                key={row.day_of_week}
                                className={`${styles.accRow} ${isToday ? styles.accToday : ""}`}
                            >
                                <span className={styles.accDay}>
                                    {row.day_name}
                                    {isToday && (
                                        <span className={styles.todayBadge}>oggi</span>
                                    )}
                                </span>
                                <span className={`${styles.accTime} ${isClosed ? styles.accTimeClosed : ""}`}>
                                    {isClosed
                                        ? "Chiuso"
                                        : `${row.open_time} – ${row.close_time}`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
