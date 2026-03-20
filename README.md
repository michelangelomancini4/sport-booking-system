# Sport Booking — Centro Sportivo

App web per la prenotazione di campi sportivi (Padel, Calcetto).  
Progetto commissionato, sviluppato con FastAPI + React.

---

## Stack

- **Backend:** Python 3.11+, FastAPI, mysql-connector-python, Pydantic
- **Frontend:** React 19, Vite, React Router 7, CSS Modules
- **Database:** MySQL 8

---

## Avvio in locale

### Prerequisiti

- Python 3.11+
- Node.js 20+
- MySQL 8 in esecuzione

---

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# oppure: source .venv/bin/activate  (Mac/Linux)

pip install -r requirements.txt
```

Crea un file `.env` nella cartella `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tua_password
DB_NAME=db_sportbooking
DB_PORT=3306
```

Crea il database:

```bash
mysql -u root -p < backend/db/schema.sql
```

Avvia il server:

```bash
uvicorn app.main:app --reload
```

- API disponibile su: `http://127.0.0.1:8000`
- Docs interattive (Swagger): `http://127.0.0.1:8000/docs`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponibile su: `http://localhost:5173`

---

## Struttura del progetto

```
backend/
  app/
    routers/     # endpoint FastAPI (bookings, slots, fields, customers)
    repos/       # query SQL (nessun ORM, SQL puro)
    schemas.py   # modelli Pydantic — validazione input/output API
    db.py        # connessione MySQL
    main.py      # entry point FastAPI, CORS, inclusione router
  db/
    schema.sql   # schema completo del database

frontend/
  src/
    api/         # chiamate HTTP al backend (un file per risorsa)
    components/  # componenti riutilizzabili (pannelli admin)
    pages/       # pagine dell'app (Home, Booking, Admin)
    layout/      # layout condiviso con Navbar
    utils/       # funzioni di utilità (es. formattazione date)
```

---

## Database schema

| Tabella            | Descrizione                                          |
|--------------------|------------------------------------------------------|
| `sports`           | Tipi di sport disponibili (Padel, Calcetto)          |
| `fields`           | Campi fisici, collegati a uno sport                  |
| `slots`            | Fasce orarie prenotabili, una per campo              |
| `customers`        | Anagrafica clienti                                   |
| `bookings`         | Prenotazioni attive (1 slot = 1 booking)             |
| `bookings_history` | Archivio storico delle prenotazioni cancellate       |

---

## Pagine principali

| Route      | Descrizione                                      |
|------------|--------------------------------------------------|
| `/`        | Homepage pubblica con info centro e CTA prenota  |
| `/booking` | Flusso prenotazione slot lato utente             |
| `/admin`   | Dashboard gestione prenotazioni e slot           |

---

## Note di sviluppo

- I prezzi sono salvati in **centesimi** (`price_cents`) per evitare imprecisioni con i numeri decimali — es. `5000` = €50,00
- La cancellazione di una booking la copia in `bookings_history` **prima** di eliminarla da `bookings`, garantendo uno storico completo
- Gli slot vengono generati in bulk dall'admin (Generatore Slot) per sport, range di date e fasce orarie
- La ricerca cliente al momento della prenotazione avviene per numero di telefono: se esiste già, i dati vengono precompilati automaticamente

---

