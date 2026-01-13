import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function fmt(d) {
    return new Date(d).toLocaleString();
}

export default function MyReservations() {
    const [list, setList] = useState([]);
    const [error, setError] = useState("");

    const load = async () => {
        setError("");
        try {
            const res = await api.get("/reservations/me");
            setList(res.data);
        } catch {
            setError("Impossible de charger tes réservations");
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="page">
            <div className="container">
                <header className="header">
                    <h1 className="header-title">Mes réservations</h1>
                    <p className="header-subtitle">Historique de tes créneaux</p>
                </header>

                <section className="card">
                    <div className="nav-row">
                        <Link className="btn-secondary" to="/rooms">← Retour salles</Link>
                    </div>
                </section>

                {error && <section className="card"><div className="error-box">• {error}</div></section>}

                <section className="card">
                    <h2 className="card-title">Liste</h2>
                    {list.length === 0 && <p className="empty-state">Aucune réservation.</p>}

                    {list.length > 0 && (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Salle</th>
                                        <th>Créneau</th>
                                        <th>Créée le</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.map(r => (
                                        <tr key={r.id}>
                                            <td>
                                                {r.room.name} <span style={{ opacity: 0.7 }}>
                                                    ({r.room.capacity} pers • {r.room.location})
                                                </span>
                                            </td>
                                            <td>{fmt(r.start)} → {fmt(r.end)}</td>
                                            <td>{fmt(r.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
