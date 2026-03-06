import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { formatCurrency, formatDateTime } from '../utils/format';
import { toast } from 'react-toastify';

function StockForm({ stock, onClose, onSave }) {
  const [form, setForm] = useState(stock || { symbol: '', name: '', sector: 'Technology', currentPrice: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (stock?._id) {
        await api.put(`/admin/stocks/${stock._id}`, form);
        toast.success('Stock updated');
      } else {
        await api.post('/admin/stocks', form);
        toast.success('Stock created');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{stock?._id ? 'Edit Stock' : 'Add New Stock'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Symbol</label>
                <input className="form-control" value={form.symbol}
                  onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })} required disabled={!!stock?._id} />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input className="form-control" type="number" step="0.01" value={form.currentPrice}
                  onChange={e => setForm({ ...form, currentPrice: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-control" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Sector</label>
              <select className="form-control" value={form.sector}
                onChange={e => setForm({ ...form, sector: e.target.value })}>
                {['Technology', 'Finance', 'Healthcare', 'E-Commerce', 'Automotive', 'Entertainment', 'Retail', 'Consumer Goods', 'Transportation', 'Energy'].map(s =>
                  <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Stock'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalStock, setModalStock] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDashboard = async () => {
    const res = await api.get('/admin/dashboard');
    setStats(res.data);
    setRecentTx(res.data.recentTransactions || []);
  };

  const fetchUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data || []);
  };

  const fetchStocks = async () => {
    const res = await api.get('/stocks');
    setStocks(res.data.stocks || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchUsers(), fetchStocks()]);
      setLoading(false);
    };
    init();
  }, []);

  const toggleUser = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    toast.success('User status updated');
    fetchUsers();
  };

  const deleteStock = async (id, symbol) => {
    if (!window.confirm(`Deactivate ${symbol}?`)) return;
    await api.delete(`/admin/stocks/${id}`);
    toast.success('Stock deactivated');
    fetchStocks();
  };

  const seedStocks = async () => {
    const res = await api.post('/admin/seed');
    toast.success(res.data.message);
    fetchStocks();
  };

  if (loading) return <Layout title="Admin Panel"><div className="loading-spinner"><div className="spinner" /></div></Layout>;

  return (
    <Layout title="Admin Panel" subtitle="Manage stocks, users, and platform data">
      <div className="tabs" style={{ maxWidth: 400 }}>
        {[['dashboard', '📊 Dashboard'], ['users', '👥 Users'], ['stocks', '📈 Stocks']].map(([key, label]) => (
          <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Stocks</div>
              <div className="stat-value">{stats.totalStocks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value">{stats.totalTransactions}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Recent Transactions (All Users)</div></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Stock</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTx.map(tx => (
                      <tr key={tx._id}>
                        <td>{tx.user?.name || 'Unknown'}</td>
                        <td><strong>{tx.symbol}</strong></td>
                        <td><span className={`badge ${tx.type === 'BUY' ? 'badge-success' : 'badge-danger'}`}>{tx.type}</span></td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{formatCurrency(tx.total)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDateTime(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Registered Users ({users.length})</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{formatCurrency(u.virtualBalance)}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDateTime(u.createdAt)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleUser(u._id)}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'stocks' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Stock Listings ({stocks.length})</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={seedStocks}>🌱 Seed Stocks</button>
              <button className="btn btn-primary btn-sm" onClick={() => { setModalStock(null); setShowModal(true); }}>+ Add Stock</button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Sector</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{s.symbol}</td>
                      <td>{s.name}</td>
                      <td><span className="badge badge-primary">{s.sector}</span></td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{formatCurrency(s.currentPrice)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setModalStock(s); setShowModal(true); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteStock(s._id, s.symbol)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <StockForm
          stock={modalStock}
          onClose={() => setShowModal(false)}
          onSave={fetchStocks}
        />
      )}
    </Layout>
  );
}
