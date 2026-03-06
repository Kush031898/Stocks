import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { formatCurrency } from '../utils/format';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Watchlist() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      setStocks(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWatchlist(); }, []);

  const remove = async (symbol) => {
    try {
      await api.delete(`/watchlist/${symbol}`);
      toast.success(`${symbol} removed from watchlist`);
      setStocks(s => s.filter(st => st.symbol !== symbol));
    } catch (e) { toast.error('Failed to remove'); }
  };

  return (
    <Layout title="Watchlist" subtitle="Stocks you're monitoring">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Watched Stocks ({stocks.length})</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/stocks')}>+ Add Stocks</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : stocks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👀</div>
              <div className="empty-title">Your watchlist is empty</div>
              <div className="empty-desc">Add stocks from the Markets page to monitor them here</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/stocks')}>Browse Markets</button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Sector</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Change</th>
                    <th style={{ textAlign: 'right' }}>Day High</th>
                    <th style={{ textAlign: 'right' }}>Day Low</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(s => {
                    const up = s.changePercent >= 0;
                    return (
                      <tr key={s.symbol}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                              {s.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{s.symbol}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.name}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-primary">{s.sector}</span></td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700 }}>{formatCurrency(s.currentPrice)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`price-badge ${up ? 'up' : 'down'}`}>
                            {up ? '▲' : '▼'} {Math.abs(s.changePercent || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{formatCurrency(s.dayHigh)}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{formatCurrency(s.dayLow)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button className="btn btn-success btn-sm" onClick={() => navigate('/stocks')}>Trade</button>
                            <button className="btn btn-danger btn-sm" onClick={() => remove(s.symbol)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
