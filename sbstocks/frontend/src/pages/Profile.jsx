import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { updateBalance } from '../redux/slices/authSlice';
import { formatCurrency, getInitials } from '../utils/format';

export default function Profile() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password && form.password.length < 6) return toast.error('Min 6 characters');
    setLoading(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;
      await api.put('/auth/profile', payload);
      toast.success('Profile updated!');
      dispatch(updateBalance());
      setForm(f => ({ ...f, password: '', confirm: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <Layout title="Profile" subtitle="Manage your account settings">
      <div style={{ maxWidth: 560 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                {getInitials(user?.name)}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</div>
                <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-primary'}`} style={{ marginTop: 6 }}>
                  {user?.role === 'admin' ? '⭐ Admin' : '👤 Trader'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Virtual Balance</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--mono)', color: 'var(--primary)' }}>{formatCurrency(user?.virtualBalance)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Starting Capital</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--mono)' }}>$100,000.00</div>
              </div>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-control" value={user?.email} disabled
                  style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                <input className="form-control" type="password" placeholder="New password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              {form.password && (
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input className="form-control" type="password" placeholder="Confirm password"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
                </div>
              )}
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
