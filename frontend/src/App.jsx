import './App.css'
import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://127.0.0.1:8000/slots/free?day=2026-01-23");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e?.message || "Errore");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  return (
    <div >
      <h1>Sports Booking Manager</h1>

      {loading && <p>Caricamento...</p>}

      {!loading && !error && (
        <>
          <h2>Slot liberi</h2>

          {data?.rows?.length === 0 ? (
            <p>Nessuno slot libero per questo giorno.</p>
          ) : (
            <ul>
              {data.rows.map((s) => (
                <li key={s.id_slots}>
                  <b>{s.field_name}</b>{" "}
                  {new Date(s.starts_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  {" - "}
                  {new Date(s.ends_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  {" · "}
                  €{(s.price_cents / 100).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

    </div>
  );
}
