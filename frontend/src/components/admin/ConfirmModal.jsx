export default function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
        }}>
            <div style={{
                background: "white",
                borderRadius: 16,
                padding: "28px 32px",
                maxWidth: 360,
                width: "90%",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "#1a1a1a" }}>
                    {message}
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button onClick={onCancel} style={{
                        padding: "8px 18px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "white",
                        cursor: "pointer",
                        fontSize: 14,
                    }}>
                        Annulla
                    </button>
                    <button onClick={onConfirm} style={{
                        padding: "8px 18px",
                        borderRadius: 8,
                        border: "none",
                        background: "#e53e3e",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                    }}>
                        Conferma
                    </button>
                </div>
            </div>
        </div>
    );
}