import "./App.css";
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
const CUSTOMER_ID = 1;

// helper: YYYY-MM-DD di oggi
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function App() {
  const [day, setDay] = useState("2026-01-23"); // per demo: metti il giorno che sai che ha slot
  const [slotsData, setSlotsData] = useState({ rows: [], day });
  const [bookingsData, setBookingsData] = useState({ rows: [] });

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadFreeSlots(selectedDay = day) {
    try {
      setLoadingSlots(true);
      setError("");
      setMessage("");

      const res = await fetch(`${API}/slots/free?day=${selectedDay}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      setSlotsData(json);
    } catch (e) {
      setError(e?.message || "Errore");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function loadBookings() {
    try {
      setLoadingBookings(true);
      setError("");
      setMessage("");

      const res = await fetch(`${API}/bookings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      setBookingsData(json);
    } catch (e) {
      setError(e?.message || "Errore");
    } finally {
      setLoadingBookings(false);
    }
  }

  async function book(slotId) {
    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: slotId,
          customer_id: CUSTOMER_ID,
          players_count: 1,
          notes: "Booking from React demo",
        }),
      });

      if (res.status === 409) {
        setMessage("Slot già prenotato (409).");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setMessage("Prenotazione creata ✅");
      await loadFreeSlots(); // aggiorna user view
      await loadBookings();  // aggiorna admin view
    } catch (e) {
      setError(e?.message || "Errore");
    }
  }

  async function cancelBooking(bookingId) {
    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/bookings/${bookingId}`, { method: "DELETE" });
      if (res.status === 404) {
        setMessage("Booking non trovata (404).");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setMessage("Prenotazione annullata ✅");
      await loadFreeSlots();
      await loadBookings();
    } catch (e) {
      setError(e?.message || "Errore");
    }
  }

  // al primo load: carichiamo entrambi
  useEffect(() => {
    loadFreeSlots(day);
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1>Sports Booking Manager (Demo)</h1>

      {error && (
        <p>
          <b>Errore:</b> {error}
        </p>
      )}
      {message && <p>{message}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* USER BOX */}
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h2>User</h2>

          <label style={{ display: "block", marginBottom: 8 }}>
            Giorno:{" "}
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => loadFreeSlots(day)} disabled={loadingSlots}>
              {loadingSlots ? "Carico..." : "Carica slot liberi"}
            </button>
          </div>

          {slotsData?.rows?.length === 0 ? (
            <p>Nessuno slot libero per questo giorno.</p>
          ) : (
            <ul>
              {slotsData.rows.map((s) => (
                <li key={s.id_slots} style={{ marginBottom: 8 }}>
                  <b>{s.field_name}</b>{" "}
                  {new Date(s.starts_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  {" - "}
                  {new Date(s.ends_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  {" · "}€{(s.price_cents / 100).toFixed(2)}{" "}
                  <button onClick={() => book(s.id_slots)}>Prenota</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ADMIN BOX */}
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h2>Admin</h2>

          <button onClick={loadBookings} disabled={loadingBookings}>
            {loadingBookings ? "Carico..." : "Ricarica prenotazioni"}
          </button>

          {bookingsData?.rows?.length === 0 ? (
            <p>Nessuna prenotazione.</p>
          ) : (
            <ul style={{ marginTop: 12 }}>
              {bookingsData.rows.map((b) => (
                <li key={b.id_booking} style={{ marginBottom: 10 }}>
                  <div>
                    <b>{b.field_name}</b> — {b.full_name}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {new Date(b.starts_at).toLocaleString("it-IT")} →{" "}
                    {new Date(b.ends_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <button onClick={() => cancelBooking(b.id_booking)} style={{ marginTop: 6 }}>
                    Annulla
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
