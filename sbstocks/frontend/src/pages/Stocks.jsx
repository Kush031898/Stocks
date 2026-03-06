import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/format';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { updateBalance } from '../redux/slices/authSlice';

function TradeModal({ stock, onClose, onSuccess }) {
  const [type, setType] = useState('BUY');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const total = stock.currentPrice * qty;

  const handleTrade = async () => {
    if (qty < 1) return toast.error('Quantity must be at least 1');
    setLoading(true);
    try {
      const endpoint = type === 'BUY' ? '/transactions/buy' : '/transactions/sell';
      await api.post(endpoint, { stockId: stock._id, quantity: Number(qty) });
      toast.success(`${type === 'BUY' ? 'Bought' : 'Sold'} ${qty} shares of ${stock.symbol}`);
      dispatch(updateBalance());
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{stock.symbol} — {stock.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Current Price: <strong style={{ fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>{formatCurrency(stock.currentPrice)}</strong>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="tabs">
            <button className={`tab ${type === 'BUY' ? 'active' : ''}`} onClick={() => setType('BUY')}>📈 Buy</button>
            <button className={`tab ${type === 'SELL' ? 'active' : ''}`} onClick={() => setType('SELL')}>📉 Sell</button>
          </div>

          <div className="form-group">
            <label className="form-label">Number of Shares</label>
            <input className="form-control" type="number" min="1"
              value={qty} onChange={e => setQty(e.target.value)} />
          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>Price per share</span>
              <span style={{ fontFamily: 'var(--mono)' }}>{formatCurrency(stock.currentPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>Quantity</span>
              <span>{qty} shares</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <span>Total</span>
              <span style={{ fontFamily: 'var(--mono)', color: type === 'BUY' ? 'var(--success)' : 'var(--danger)' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            className={`btn btn-full btn-lg ${type === 'BUY' ? 'btn-success' : 'btn-danger'}`}
            onClick={handleTrade} disabled={loading}>
            {loading ? 'Processing...' : `${type === 'BUY' ? 'Buy' : 'Sell'} ${qty} Share${qty > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [sectors, setSectors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStocks = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (sector) params.append('sector', sector);
      const res = await api.get(`/stocks?${params}`);
      setStocks(res.data.stocks || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  }, [page, search, sector]);

  useEffect(() => {
    const fetchSectors = async () => {
      const res = await api.get('/stocks/sectors/list');
      setSectors(res.data || []);
    };
    fetchSectors();
  }, []);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await api.get('/stocks/refresh/prices');
    await fetchStocks();
    setRefreshing(false);
    toast.success('Prices refreshed!');
  };

  const addToWatchlist = async (symbol) => {
    try {
      await api.post(`/watchlist/${symbol}`);
      toast.success(`${symbol} added to watchlist`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <Layout title="Markets" subtitle="Browse and trade US stocks">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Search stocks by name or symbol..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={sector}
          onChange={e => { setSector(e.target.value); setPage(1); }}>
          <option value="">All Sectors</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /><span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading stocks...</span></div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Sector</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Change</th>
                  <th style={{ textAlign: 'right' }}>Volume</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map(stock => {
                  const up = stock.changePercent >= 0;
                  return (
                    <tr key={stock._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                            {stock.symbol.slice(0, 3)}
                          </div>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{stock.symbol}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{stock.name}</td>
                      <td><span className="badge badge-primary">{stock.sector}</span></td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600 }}>{formatCurrency(stock.currentPrice)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`price-badge ${up ? 'up' : 'down'}`}>
                          {up ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 13 }}>{formatNumber(stock.volume)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn btn-success btn-sm" onClick={() => setSelected(stock)}>Trade</button>
                          <button className="btn btn-outline btn-sm" onClick={() => addToWatchlist(stock.symbol)}>+ Watch</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return p <= totalPages ? (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ) : null;
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        </>
      )}

      {selected && <TradeModal stock={selected} onClose={() => setSelected(null)} onSuccess={fetchStocks} />}
    </Layout>
  );
}
