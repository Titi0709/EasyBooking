import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function Rooms() {
    const { user, logout } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        roomId: "",
        start: "",
        end: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/rooms");
            setRooms(res.data);
            if (!form.roomId && res.data[0]) setForm((p) => ({ ...p, roomId: res.data[0].id }));
        } catch (e) {
            setError("Impossible de charger les salles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const book = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            await api.post("/reservations", form);
            setSuccess("Réservation créée ✅");
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Erreur réservation");
        }
    };

    return (
        <div className="page">
            <div className="container">
                <header className="header">
                    <h1 className="header-title">EasyBooking</h1>
                    <p className="header-subtitle">Connecté : {user?.name} ({user?.email})</p>
                </header>

                <section className="card">
                    <div className="nav-row">
                        <Link className="btn-secondary" to="/my-reservations">Mes réservations</Link>
                        <button className="btn-danger" onClick={logout}>Déconnexion</button>
                    </div>
                </section>

                <section className="card">
                    <h2 className="card-title">Salles disponibles</h2>
                    {loading && <p className="empty-state">Chargement...</p>}
                    {!loading && (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Capacité</th>
                                        <th>Emplacement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rooms.map(r => (
                                        <tr key={r.id}>
                                            <td>{r.name}</td>
                                            <td>{r.capacity}</td>
                                            <td>{r.location}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="card">
                    <h2 className="card-title">Réserver une salle</h2>

                    {error && <div className="error-box">• {error}</div>}
                    {success && <div className="success-box">• {success}</div>}

                    <form onSubmit={book}>
                        <div className="field">
                            <label className="label">Salle</label>
                            <select className="input" value={form.roomId}
                                onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        <div className="field-row">
                            <div className="field">
                                <label className="label">Début</label>
                                <input className="input" type="datetime-local" value={form.start}
                                    onChange={(e) => setForm({ ...form, start: e.target.value })} required />
                            </div>
                            <div className="field">
                                <label className="label">Fin</label>
                                <input className="input" type="datetime-local" value={form.end}
                                    onChange={(e) => setForm({ ...form, end: e.target.value })} required />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn-primary" type="submit">Réserver</button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
