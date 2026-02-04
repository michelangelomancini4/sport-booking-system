import styles from "./HomePage.module.css"
import foto1 from "../assets/foto1.png";
import foto2 from "../assets/foto2.png";



export default function HomePage() {
    return (
        <div>
            <div className={styles.hometitle}>
                <h1>PRENOTA ORA </h1>
            </div>

            <div className={styles.jumbotron}>
                <div className={styles.jumbo_left_box} style={{
                    backgroundImage: `url(${foto1})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}>
                    <h3>foto1</h3>
                </div>
                <div className={styles.jumbo_right_box} style={{
                    backgroundImage: `url(${foto2})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }} >
                    <h3>foto2</h3>
                </div>
            </div>
        </div >
    )
}