import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./AdminPage.module.css";

import SlotGenerator from "../components/admin/SlotGenerator";
import BookingsPanel from "../components/admin/BookingsPanel";
import BookingDetailPanel from "../components/admin/BookingDetailPanel";
import OpeningHoursEditor from "../components/admin/OpeningHoursEditor";

export default function AdminPage() {
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isHistory, setIsHistory] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
                <p className={styles.subtitle}>Gestione operativa del centro sportivo.</p>

            </header>

            <div className={styles.sections_container}>

                {/* RIGA 1 — usata ogni giorno */}
                <div className={styles.toprow}>
                    <div className={styles.bookinglist}>
                        <BookingsPanel
                            selectedBookingId={selectedBookingId}
                            onSelectBooking={(id, booking) => {
                                setSelectedBookingId(id);
                                setSelectedBooking(booking);
                            }}
                            onModeChange={(mode) => {
                                setIsHistory(mode === "history");
                                setSelectedBookingId(null);
                                setSelectedBooking(null);
                            }}
                        />
                    </div>
                    <div className={styles.bookingdetail}>
                        <BookingDetailPanel
                            selectedBookingId={selectedBookingId}
                            selectedBooking={selectedBooking}
                            isHistory={isHistory}
                        />
                    </div>
                </div>

                {/* RIGA 2 — usata occasionalmente */}
                <div className={styles.bottomrow}>
                    <section className={styles.card} style={{ flex: 58 }}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardTitle}>Generatore Slot</h2>
                                <p className={styles.cardSubtitle}>
                                    Crea slot in bulk per sport e intervallo date.
                                </p>
                            </div>
                        </div>
                        <SlotGenerator styles={styles} />
                    </section>

                    <section className={styles.card} style={{ flex: 38 }}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardTitle}>Orari di apertura</h2>
                                <p className={styles.cardSubtitle}>
                                    Modifica gli orari settimanali del centro.
                                </p>
                            </div>
                        </div>
                        <OpeningHoursEditor />
                    </section>
                </div>

            </div>
        </div>
    );
}