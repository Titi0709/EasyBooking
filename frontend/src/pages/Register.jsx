import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setErrors([]);
        try {
            const res = await api.post("/auth/register", form);
            login(res.data);
            navigate("/rooms");
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
            else setError(err.response?.data?.error || "Erreur d'inscription");
        }
    };

    return (
        <div className="page">
            <div className="container">
                <header className="header">
                    <h1 className="header-title">EasyBooking</h1>
                    <p className="header-subtitle">Créer un compte</p>
                </header>

                <section className="card">
                    <h2 className="card-title">Inscription</h2>

                    {error && <div className="error-box">• {error}</div>}
                    {errors.length > 0 && (
                        <div className="error-box">
                            {errors.map((e, i) => <div key={i}>• {e}</div>)}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="field">
                            <label className="label">Nom</label>
                            <input className="input" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>

                        <div className="field">
                            <label className="label">Email</label>
                            <input className="input" type="email" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>

                        <div className="field">
                            <label className="label">Mot de passe (supérieur ou = à 6)</label>
                            <input className="input" type="password" value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                        </div>

                        <div className="form-actions">
                            <button className="btn-primary" type="submit">Créer</button>
                            <Link className="btn-secondary" to="/login">J’ai déjà un compte</Link>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
