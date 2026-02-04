import styles from "./HomePage.module.css"
export default function HomePage() {
    return (
        <div>
            <div className={styles.hometitle}>
                <h1>PRENOTA ORA </h1>
            </div>
            <div className={styles.jumbotron}>
                <div>
                    <h3>foto1</h3>
                </div>
                <div>
                    <h3>foto2</h3>
                </div>
            </div>
        </div>
    )
}