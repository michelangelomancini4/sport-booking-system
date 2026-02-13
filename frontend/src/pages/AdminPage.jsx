import styles from "./AdminPage.module.css";

import SlotGenerator from "../components/admin/SlotGenerator";
import BookingsPanel from "../components/admin/BookingsPanel";

export default function AdminPage() {
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

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Prenotazioni</h2>
                        <p className={styles.cardSubtitle}>
                            Lista prenotazioni e annullamento (DELETE).
                        </p>
                    </div>

                    <BookingsPanel styles={styles} />
                </section>
            </div>
        </div>
    );
}
