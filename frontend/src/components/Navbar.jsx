import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
    return (
        <nav className={styles.nav}>
            <NavLink
                to="/"
                className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                }
            >
                <div className={styles.logo}>Sport Booking</div>

            </NavLink>


            <div className={styles.links}>
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? `${styles.link} ${styles.active}` : styles.link
                    }
                    end
                >
                    Home
                </NavLink>

                <NavLink
                    to="/booking"
                    className={({ isActive }) =>
                        isActive ? `${styles.link} ${styles.active}` : styles.link
                    }
                >
                    Prenota
                </NavLink>

                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        isActive ? `${styles.link} ${styles.active}` : styles.link
                    }
                >
                    Admin
                </NavLink>

                <NavLink
                    to="/demo"
                    className={({ isActive }) =>
                        isActive ? `${styles.link} ${styles.active}` : styles.link
                    }
                >
                    Demo
                </NavLink>
            </div>
        </nav>
    );
}
