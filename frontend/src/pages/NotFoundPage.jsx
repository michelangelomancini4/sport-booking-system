import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
    return (
        <div className={styles.page}>
            <div className={styles.code}>404</div>
            <h1 className={styles.title}>Pagina non trovata</h1>
            <p className={styles.subtitle}>
                La pagina che cerchi non esiste o è stata spostata.
            </p>
            <Link to="/" className={styles.btn}>
                Torna alla Home
            </Link>
        </div>
    );
}