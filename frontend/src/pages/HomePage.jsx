import styles from "./HomePage.module.css"
import foto1 from "../assets/foto1.png";
import foto2 from "../assets/foto2.png";
import { Link } from "react-router-dom";



export default function HomePage() {
    return (
        <div>
            <div className={styles.hometitle}>
                <h1>PRENOTA ORA </h1>
            </div>
            {/* JUMBOTRON SECTION */}
            <div className={styles.jumbotron}>
                <div className={styles.jumbo_left_box} style={{
                    backgroundImage: `url(${foto1})`,

                }}>
                    <h3>foto1</h3>
                </div>
                <div className={styles.jumbo_right_box} style={{
                    backgroundImage: `url(${foto2})`,

                }} >
                    <h3>foto2</h3>
                </div>
            </div>
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
            <div className={styles.cards_container}>
                <div className={styles.first_card}>
                    <h4>card</h4>
                </div>
                <div className={styles.second_card}>
                    <h4>card</h4>
                </div>
                <div className={styles.third_card}>
                    <h4>card</h4>
                </div>

            </div>
        </div >
    )
}