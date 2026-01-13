import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await api.post("/auth/login", form);
            login(res.data);
            navigate("/rooms");
        } catch (err) {
            setError(err.response?.data?.error || "Erreur de connexion");
        }
    };

    return (
        <div className="page">
            <div className="container">
                <header className="header">
                    <h1 className="header-title">EasyBooking</h1>
                    <p className="header-subtitle">Connecte-toi pour réserver une salle</p>
                </header>

                <section className="card">
                    <h2 className="card-title">Connexion</h2>

                    {error && <div className="error-box">• {error}</div>}

                    <form onSubmit={submit}>
                        <div className="field">
                            <label className="label">Email</label>
                            <input className="input" type="email" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>

                        <div className="field">
                            <label className="label">Mot de passe</label>
                            <input className="input" type="password" value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                        </div>

                        <div className="form-actions">
                            <button className="btn-primary" type="submit">Se connecter</button>
                            <Link className="btn-secondary" to="/register">Créer un compte</Link>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
