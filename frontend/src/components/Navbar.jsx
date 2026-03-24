import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { House, CalendarDays, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

// Ogni voce di navigazione ha testo + icona associata.
// L'icona viene mostrata solo nel menu mobile (via CSS),
// sul desktop è nascosta — zero JSX duplicato.

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const close = () => setOpen(false);

    function handleLogout() {
        close();
        logout();
        navigate("/login");
    }

    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.inner}>
                    <NavLink to="/" onClick={close} className={styles.brandLink}>
                        <div className={styles.logo}>
                            Sport<span className={styles.logoAccent}>Booking</span>
                        </div>
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
                            <House className={styles.navIcon} size={18} />
                            <span>Home</span>
                        </NavLink>

                        <NavLink
                            to="/booking"
                            onClick={close}
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.active}` : styles.link
                            }
                        >
                            <CalendarDays className={styles.navIcon} size={18} />
                            <span>Prenota</span>
                        </NavLink>

                        {isAuthenticated && (
                            <NavLink
                                to="/admin"
                                onClick={close}
                                className={({ isActive }) =>
                                    isActive ? `${styles.link} ${styles.active}` : styles.link
                                }
                            >
                                <Settings className={styles.navIcon} size={18} />
                                <span>Admin</span>
                            </NavLink>
                        )}

                        {isAuthenticated ? (
                            <button onClick={handleLogout} className={styles.logoutBtn}>
                                <LogOut className={styles.navIcon} size={18} />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <NavLink
                                to="/login"
                                onClick={close}
                                className={({ isActive }) =>
                                    isActive ? `${styles.link} ${styles.active}` : styles.link
                                }
                            >
                                <Settings className={styles.navIcon} size={18} />
                                <span>Admin</span>
                            </NavLink>
                        )}
                    </div>
                </div>
            </nav>
            {
                open && (
                    <div
                        className={styles.overlay}
                        onClick={close}
                        aria-hidden="true"
                    />
                )
            }
        </>
    );
}
