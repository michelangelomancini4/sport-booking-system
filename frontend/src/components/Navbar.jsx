import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";  // ← nuovo
import styles from "./Navbar.module.css";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();  // ← nuovo
    const navigate = useNavigate();                  // ← nuovo

    const close = () => setOpen(false);

    function handleLogout() {
        close()
        logout()
        navigate("/login")
    }

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <NavLink to="/" onClick={close} className={styles.brandLink}>
                    <div className={styles.logo}>Sport Booking</div>
                </NavLink>

                <button
                    className={styles.menuBtn}
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Chiudi menu" : "Apri menu"}
                    aria-expanded={open}
                >
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

                    {/* Link Admin visibile solo se autenticato */}
                    {isAuthenticated && (
                        <NavLink
                            to="/admin"
                            onClick={close}
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.active}` : styles.link
                            }
                        >
                            Admin
                        </NavLink>
                    )}

                    {/* Bottone logout oppure link login */}
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className={styles.logoutBtn}
                        >
                            Logout
                        </button>
                    ) : (
                        <NavLink
                            to="/login"
                            onClick={close}
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.active}` : styles.link
                            }
                        >
                            Login
                        </NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
}