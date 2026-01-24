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

        const res = await fetch("http://127.0.0.1:8000/health");
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

      {!loading && error && (
        <p>
          <b>Errore:</b> {error}
        </p>
      )}

      {!loading && !error && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
