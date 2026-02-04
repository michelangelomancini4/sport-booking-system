import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import styles from "./DefaultLayout.module.css";

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
                <span>© {new Date().getFullYear()} Sport Booking</span>
            </footer>
        </div>
    );
}
