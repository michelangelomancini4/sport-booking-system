import { Outlet, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./DefaultLayout.module.css";
import { Instagram, Youtube, Facebook } from "lucide-react";


export default function DefaultLayout() {
    return (
        <div className={styles.appShell}>
            <header className={styles.header}>
                <Navbar />
            </header>

            <main className={styles.main}>
                <Outlet />
            </main>

            <footer className={styles.footer}>
                <div className={styles.footer_top}>

                    <div className={styles.footer_brand_col}>
                        <div className={styles.footer_brand}>
                            Sport<span>Booking</span>
                        </div>
                        <p className={styles.footer_tagline}>
                            Prenota il tuo campo in pochi click.
                        </p>
                        <div className={styles.footer_socials}>
                            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className={styles.soc_icon} aria-label="Instagram">
                                <Instagram size={16} />
                            </a>
                            <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className={styles.soc_icon} aria-label="YouTube">
                                <Youtube size={16} />
                            </a>
                            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className={styles.soc_icon} aria-label="Facebook">
                                <Facebook size={16} />
                            </a>
                        </div>
                    </div>

                    <div className={styles.footer_col}>
                        <p className={styles.footer_col_title}>Orari</p>
                        <p className={styles.footer_col_text}>Lun – Dom</p>
                        <p className={styles.footer_col_text}>09:00 – 23:00</p>
                    </div>

                    <div className={styles.footer_col}>
                        <p className={styles.footer_col_title}>Contatti</p>
                        <p className={styles.footer_col_text}>+39 000 000 0000</p>
                        <p className={styles.footer_col_text}>info@sportbooking.it</p>
                    </div>

                    <div className={styles.footer_col}>
                        <p className={styles.footer_col_title}>Link rapidi</p>
                        <Link to="/booking" className={styles.footer_link}>Prenota</Link>
                        <Link to="/login" className={styles.footer_link}>Admin</Link>
                    </div>

                </div>

                <div className={styles.footer_bottom}>
                    <p className={styles.footer_copy}>
                        © {new Date().getFullYear()} Sport Booking — tutti i diritti riservati
                    </p>
                </div>
            </footer>
        </div>
    );
}
