import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { login, branding } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@monotours24.de');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="login-icon">✈️</span>
          <div className="login-brand-text">
            <span className="login-title">{branding?.brandName || 'Monotours24'}</span>
            <span className="login-subtitle">Sicheres Administratoren-Portal</span>
          </div>
        </div>
        <h1>Willkommen zurück</h1>
        <p className="login-copy">Verwalten Sie Inhalte, Angebote, Nutzer und Einstellungen in Echtzeit.</p>
        {error && <div className="login-error">{error}</div>}
        <label className="form-field">
          <span>E-Mail</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
        </label>
        <label className="form-field">
          <span>Passwort</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Anmeldung …' : 'Anmelden'}
        </button>
        <p className="login-hint">Demo-Zugang: admin@monotours24.de · admin123</p>
      </form>
    </div>
  );
}
