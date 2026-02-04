import { NavLink } from "react-router-dom";

export default function Navbar() {
    return (
        <nav style={styles.nav}>
            <h3 style={styles.logo}>Sport Booking</h3>

            <div style={styles.links}>
                <NavLink to="/" style={styles.link}>
                    Home
                </NavLink>
                <NavLink to="/booking" style={styles.link}>
                    Prenota
                </NavLink>
                <NavLink to="/admin" style={styles.link}>
                    Admin
                </NavLink>
                <NavLink to="/demo" style={styles.link}>
                    Demo
                </NavLink>

            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: "1px solid #ddd",
    },
    logo: {
        margin: 0,
    },
    links: {
        display: "flex",
        gap: "16px",
    },
    link: {
        textDecoration: "none",
        color: "#333",
    },
};
