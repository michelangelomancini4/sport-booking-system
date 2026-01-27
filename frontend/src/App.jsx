import "./App.css";
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";


export default function App() {
  const [day, setDay] = useState("2026-01-23");
  const [slotsData, setSlotsData] = useState({ rows: [], day });
  const [bookingsData, setBookingsData] = useState({ rows: [] });

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");


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
          customer_id: selectedCustomerId,
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

  async function loadCustomers() {
    try {
      const res = await fetch(`${API}/customers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setCustomers(json.rows || []);
      if (json.rows?.length) {
        setSelectedCustomerId(json.rows[0].id); // default: primo cliente
      }
    } catch (e) {
      setError(e?.message || "Errore caricamento clienti");
    }
  }


  // al primo load: carichiamo entrambi
  useEffect(() => {
    loadFreeSlots(day);
    loadBookings();
    loadCustomers();
  }, []);


  return (
    <div className="app">
      <h1>Sports Booking Manager (Demo)</h1>

      {error && (
        <p className="error">
          <b>Errore:</b> {error}
        </p>
      )}

      {message && <p className="message">{message}</p>}

      <div className="grid">
        {/* USER BOX */}
        <section className="box user">
          <h2>User</h2>

          <label>
            Giorno:
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </label>

          <label>
            Cliente:
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </label>

          <div className="actions">
            <button onClick={() => loadFreeSlots(day)} disabled={loadingSlots}>
              {loadingSlots ? "Carico..." : "Carica slot liberi"}
            </button>
          </div>

          {slotsData?.rows?.length === 0 ? (
            <p>Nessuno slot libero per questo giorno.</p>
          ) : (
            <ul>
              {slotsData.rows.map((s) => (
                <li key={s.id_slots} className="slot-item">
                  <b>{s.field_name}</b>{" "}
                  {new Date(s.starts_at).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" - "}
                  {new Date(s.ends_at).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" · "}€{(s.price_cents / 100).toFixed(2)}
                  <button onClick={() => book(s.id_slots)}>Prenota</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ADMIN BOX */}
        <section className="box admin">
          <h2>Admin</h2>

          <div className="actions">
            <button onClick={loadBookings} disabled={loadingBookings}>
              {loadingBookings ? "Carico..." : "Ricarica prenotazioni"}
            </button>
          </div>

          {bookingsData?.rows?.length === 0 ? (
            <p>Nessuna prenotazione.</p>
          ) : (
            <ul>
              {bookingsData.rows.map((b) => (
                <li key={b.id_booking} className="booking-item">
                  <div>
                    <b>{b.field_name}</b> — {b.full_name}
                  </div>

                  <div className="meta">📞 {b.phone || "—"}</div>

                  <div className="meta">
                    {new Date(b.starts_at).toLocaleString("it-IT")} →{" "}
                    {new Date(b.ends_at).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <button onClick={() => cancelBooking(b.id_booking)}>
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
