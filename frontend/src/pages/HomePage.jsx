import styles from "./HomePage.module.css"
import foto1 from "../assets/foto1.png";
import foto2 from "../assets/foto2.png";
import { Link } from "react-router-dom";



export default function HomePage() {
    return (
        <div className={styles.page}>

            {/* JUMBOTRON SECTION */}
            <div className={styles.jumbotron}>
                <div
                    className={styles.jumbo_bg}
                    style={{ backgroundImage: `url(${foto1})` }}
                />
                <div className={styles.jumbo_overlay}>
                    <div className={styles.jumbo_eyebrow}>
                        <span className={styles.jumbo_eyebrow_line} />
                        Centro Sportivo
                    </div>
                    <h1 className={styles.jumbo_title}>
                        Gioca.<br />Prenota.<br /><span>Divertiti.</span>
                    </h1>
                    <p className={styles.jumbo_subtitle}>
                        Prenotazione semplice. Nessuna attesa.
                    </p>
                    <div className={styles.jumbo_actions}>
                        <Link to="/booking" className={styles.jumbo_cta}>Prenota ora</Link>
                        <Link to="/booking" className={styles.jumbo_ghost}>
                            Scopri gli orari
                            <span className={styles.jumbo_ghost_circle}>→</span>
                        </Link>
                    </div>
                </div>

                <svg
                    className={styles.jumbo_wave}
                    viewBox="0 0 1440 80"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#0f172a" />
                </svg>
            </div>



            {/* CTA ROW */}
            <div className={styles.cta_row_container}>
                <div className={styles.cta_row}>
                    <div className={styles.cta_left}>
                        <h3 className={styles.cta_title}>Prenota in pochi click</h3>
                        <p className={styles.cta_sub}>Scegli sport, giorno e orario disponibile</p>
                    </div>
                    <div className={styles.cta_steps}>
                        <div className={styles.step}><span className={styles.step_num}>1</span>Scegli sport</div>
                        <span className={styles.step_sep}>·</span>
                        <div className={styles.step}><span className={styles.step_num}>2</span>Seleziona slot</div>
                        <span className={styles.step_sep}>·</span>
                        <div className={styles.step}><span className={styles.step_num}>3</span>Conferma</div>
                    </div>
                </div>
            </div>
            {/* CARDS SECTION */}
            <section className={styles.cardsSection}>
                <div className={styles.cardsContainer}>
                    <article className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="1.5">
                                <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
                                <circle cx="8" cy="6" r="1.5" />
                            </svg>
                        </div>
                        <div className={styles.cardBody}>
                            <h4 className={styles.cardTitle}>Dove siamo</h4>
                            <p className={styles.cardText}>Indirizzo / zona</p>
                            <a className={styles.cardLink} href="https://www.google.com/maps?q=centro%20sportivo%20padel" target="_blank" rel="noreferrer">
                                Apri su Maps →
                            </a>
                        </div>
                    </article>

                    <article className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="1.5">
                                <circle cx="8" cy="8" r="6" />
                                <path d="M8 4.5V8l2.5 2" />
                            </svg>
                        </div>
                        <div className={styles.cardBody}>
                            <h4 className={styles.cardTitle}>Orari</h4>
                            <p className={styles.cardText}>09:00 – 23:00</p>
                            <p className={styles.cardHint}>Tutti i giorni</p>
                        </div>
                    </article>

                    <article className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#22c55e" strokeWidth="1.5">
                                <path d="M3 3h2l1 3-1.5 1.5a9 9 0 003 3L9 9l3 1v2a1 1 0 01-1 1A11 11 0 012 4a1 1 0 011-1z" />
                            </svg>
                        </div>
                        <div className={styles.cardBody}>
                            <h4 className={styles.cardTitle}>Contatti</h4>
                            <p className={styles.cardText}>Telefono / WhatsApp</p>
                            <a className={styles.cardLink} href="https://wa.me/393331234567" target="_blank" rel="noreferrer">
                                Scrivici su WhatsApp →
                            </a>
                        </div>
                    </article>
                </div>
            </section>


        </div >
    )
}