import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const { loading, error, user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    dispatch(register({ name: form.name, email: form.email, password: form.password }));
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
            Start Trading<br />Risk-Free Today.
          </h1>
          <p style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.7, marginBottom: 40, maxWidth: 400 }}>
            Get $100,000 in virtual funds to practice trading US stocks. 
            Build skills and confidence before trading with real money.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>Your starting balance</div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>$100,000.00</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Virtual USD — No risk</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="logo-icon">SB</div>
            <div className="logo-text" style={{ fontSize: 20 }}>SB Stocks</div>
          </div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub">Join thousands of paper traders</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" type="text" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type="password" placeholder="Repeat your password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
