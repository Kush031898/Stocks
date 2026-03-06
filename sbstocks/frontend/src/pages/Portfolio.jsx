import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { formatCurrency, formatPercent } from '../utils/format';
import { useNavigate } from 'react-router-dom';

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/portfolio').then(res => setPortfolio(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Portfolio"><div className="loading-spinner"><div className="spinner" /></div></Layout>;

  return (
    <Layout title="Portfolio" subtitle="Track your investments and performance">
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Cash Balance</div>
          <div className="stat-value">{formatCurrency(portfolio?.virtualBalance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invested Value</div>
          <div className="stat-value">{formatCurrency(portfolio?.currentValue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Invested</div>
          <div className="stat-value">{formatCurrency(portfolio?.totalInvested)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total P&L</div>
          <div className="stat-value" style={{ color: portfolio?.totalPnL >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(portfolio?.totalPnL)}
          </div>
          <div className="stat-change" style={{ color: portfolio?.totalPnL >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatPercent(portfolio?.totalPnLPercent)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Current Holdings ({portfolio?.holdings?.length || 0})</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/stocks')}>+ Buy Stocks</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {!portfolio?.holdings?.length ? (
            <div className="empty-state">
              <div className="empty-icon">💼</div>
              <div className="empty-title">Your portfolio is empty</div>
              <div className="empty-desc">Start trading to build your portfolio</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/stocks')}>Browse Stocks</button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}>Shares</th>
                    <th style={{ textAlign: 'right' }}>Avg Buy</th>
                    <th style={{ textAlign: 'right' }}>Current Price</th>
                    <th style={{ textAlign: 'right' }}>Market Value</th>
                    <th style={{ textAlign: 'right' }}>P&L</th>
                    <th style={{ textAlign: 'right' }}>P&L %</th>
                    <th style={{ textAlign: 'center' }}>24h</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map(h => (
                    <tr key={h.symbol}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                            {h.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{h.symbol}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{h.quantity}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{formatCurrency(h.avgBuyPrice)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600 }}>{formatCurrency(h.currentPrice)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600 }}>{formatCurrency(h.currentValue)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600, color: h.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`price-badge ${parseFloat(h.pnlPercent) >= 0 ? 'up' : 'down'}`}>
                          {parseFloat(h.pnlPercent) >= 0 ? '▲' : '▼'} {Math.abs(h.pnlPercent)}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`price-badge ${h.changePercent >= 0 ? 'up' : 'down'}`}>
                          {h.changePercent >= 0 ? '▲' : '▼'} {Math.abs(h.changePercent || 0).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
