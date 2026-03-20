import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <NavLink to="/" onClick={close} className={styles.brandLink}>
                    <div className={styles.logo}>Sport Booking</div>
                </NavLink>


                {/* Hamburger: visibile solo su mobile via CSS */}
                <button
                    className={styles.menuBtn}
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Chiudi menu" : "Apri menu"}
                    aria-expanded={open}
                >
                    {/* icona semplice */}
                    <span className={styles.burger} />
                    <span className={styles.burger} />
                    <span className={styles.burger} />
                </button>

                <div className={`${styles.links} ${open ? styles.open : ""}`}>
                    <NavLink
                        to="/"
                        end
                        onClick={close}
                        className={({ isActive }) =>
                            isActive ? `${styles.link} ${styles.active}` : styles.link
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/booking"
                        onClick={close}
                        className={({ isActive }) =>
                            isActive ? `${styles.link} ${styles.active}` : styles.link
                        }
                    >
                        Prenota
                    </NavLink>

                    <NavLink
                        to="/admin"
                        onClick={close}
                        className={({ isActive }) =>
                            isActive ? `${styles.link} ${styles.active}` : styles.link
                        }
                    >
                        Admin
                    </NavLink>


                </div>
            </div>
        </nav>
    );
}
