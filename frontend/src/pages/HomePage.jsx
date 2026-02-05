import styles from "./HomePage.module.css"
import foto1 from "../assets/foto1.png";
import foto2 from "../assets/foto2.png";
import { Link } from "react-router-dom";



export default function HomePage() {
    return (
        <div>

            {/* JUMBOTRON SECTION */}
            <div className={styles.jumbotron}>
                <div
                    className={styles.jumbo_left_box}
                    style={{ backgroundImage: `url(${foto1})` }}
                />

                <div
                    className={styles.jumbo_right_box}
                    style={{ backgroundImage: `url(${foto2})` }}
                />

                {/* OVERLAY */}
                <div className={styles.jumbo_overlay}>
                    <h1 className={styles.jumbo_title}>
                        Gioca. Prenota. Torna in campo.
                    </h1>
                    <p className={styles.jumbo_subtitle}>
                        Prenotazione semplice. Nessuna attesa.
                    </p>
                </div>
            </div>

            <p className={styles.homeContext}>
                Campi sportivi · Prenotazione rapida
            </p>


            {/* BOOKING BOX SECTION */}
            <div className={styles.booking_box_container}>
                <div className={styles.booking_box}>
                    <h3 className={styles.booking_title}>Prenota in pochi click</h3>
                    <p className={styles.booking_subtitle}>Scegli sport, giorno e orario</p>

                    <p className={styles.booking_sports}>Padel · Calcetto · Tennis</p>

                    <Link to="/booking" className={styles.booking_cta}>
                        Prenota ora
                    </Link>
                </div>
            </div>
            {/* CARDS SECTION */}
            <section className={styles.cardsSection}>
                <div className={styles.cardsContainer}>
                    <article className={styles.card}>
                        <div className={styles.cardIcon}>📍</div>
                        <h4 className={styles.cardTitle}>Dove siamo</h4>
                        <p className={styles.cardText}>Indirizzo / zona</p>

                        <a
                            className={styles.cardLink}
                            href="https://www.google.com/maps?q=centro%20sportivo%20padel"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Apri su Maps →
                        </a>
                    </article>

                    <article className={styles.card}>
                        <div className={styles.cardIcon}>⏰</div>
                        <h4 className={styles.cardTitle}>Orari</h4>
                        <p className={styles.cardText}>09:00 – 23:00</p>
                        <p className={styles.cardHint}>Tutti i giorni</p>
                    </article>

                    <article className={styles.card}>
                        <div className={styles.cardIcon}>📞</div>
                        <h4 className={styles.cardTitle}>Contatti</h4>
                        <p className={styles.cardText}>Telefono / WhatsApp</p>

                        <a
                            className={styles.cardLink}
                            href="https://wa.me/393331234567"
                            target="_blank"
                            rel="noreferrer"
                            title="Placeholder: cambia numero quando lo hai"
                        >
                            Scrivici su WhatsApp →
                        </a>
                    </article>
                </div>
            </section>


        </div >
    )
}