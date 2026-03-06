import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { loading, error, user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div className="logo-icon" style={{ width: 44, height: 44, fontSize: 18 }}>SB</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>SB Stocks</div>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 20, letterSpacing: -1 }}>
            Practice Trading.<br />Build Confidence.
          </h1>
          <p style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.7, marginBottom: 40, maxWidth: 400 }}>
            Simulate real US stock market trading with $100,000 virtual funds. 
            Learn strategies without risking real money.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['📈 Real-time simulated stock prices', '💼 Portfolio tracking & analytics', '🔐 Secure authentication with JWT', '📊 Advanced charts and insights'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, opacity: 0.9 }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="logo-icon">SB</div>
            <div className="logo-text" style={{ fontSize: 20 }}>SB Stocks</div>
          </div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-sub">Sign in to your trading account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control"
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password" placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one free</Link>
          </div>

          <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--primary-bg)', borderRadius: 8, fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Demo Credentials</div>
            <div style={{ color: 'var(--text-secondary)' }}>Admin: admin@sbstocks.com / admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
