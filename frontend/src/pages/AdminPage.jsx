import styles from "./AdminPage.module.css";
import { useState } from "react";

import SlotGenerator from "../components/admin/SlotGenerator";
import BookingsPanel from "../components/admin/BookingsPanel";
import BookingDetailPanel from "../components/admin/BookingDetailPanel";

export default function AdminPage() {
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
                <p className={styles.subtitle}>Gestione operativa del centro sportivo.</p>
            </header>

            <div className={styles.sections_container}>
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Generatore Slot</h2>
                        <p className={styles.cardSubtitle}>
                            Crea slot in bulk per sport e intervallo date.
                        </p>
                    </div>

                    <SlotGenerator styles={styles} />
                </section>

                <div className={styles.bookingsection}>
                    <section className={styles.bookinglist}>
                        <BookingsPanel
                            selectedBookingId={selectedBookingId}
                            onSelectBooking={setSelectedBookingId} />
                    </section>
                    <section
                        className={styles.bookingdetail}
                    >

                        <BookingDetailPanel selectedBookingId={selectedBookingId} />                    </section>
                </div>
            </div>
        </div>
    );
}
