import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { formatCurrency, formatDateTime } from '../utils/format';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, bought: 0, sold: 0 });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 15 });
        if (filter) params.append('type', filter);
        const res = await api.get(`/transactions?${params}`);
        setTransactions(res.data.transactions || []);
        setTotalPages(res.data.pages || 1);

        const allRes = await api.get('/transactions?limit=1000');
        const all = allRes.data.transactions || [];
        setStats({
          total: all.length,
          bought: all.filter(t => t.type === 'BUY').reduce((s, t) => s + t.total, 0),
          sold: all.filter(t => t.type === 'SELL').reduce((s, t) => s + t.total, 0),
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [page, filter]);

  return (
    <Layout title="Transactions" subtitle="Your complete trading history">
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Trades</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bought</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{formatCurrency(stats.bought)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sold</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{formatCurrency(stats.sold)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Transaction History</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['', 'BUY', 'SELL'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setFilter(f); setPage(1); }}>
                {f || 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No transactions found</div>
              <div className="empty-desc">Your trade history will appear here</div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'center' }}>Type</th>
                    <th style={{ textAlign: 'right' }}>Shares</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDateTime(tx.createdAt)}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{tx.symbol}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.name}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${tx.type === 'BUY' ? 'badge-success' : 'badge-danger'}`}>
                          {tx.type === 'BUY' ? '📈 BUY' : '📉 SELL'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{tx.quantity}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{formatCurrency(tx.price)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700 }}>{formatCurrency(tx.total)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-success">✓ Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
