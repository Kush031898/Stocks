import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import Layout from '../components/common/Layout';
import api from '../utils/api';
import { formatCurrency, formatPercent, formatDateTime } from '../utils/format';
import { updateBalance } from '../redux/slices/authSlice';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function Dashboard() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portRes, txRes] = await Promise.all([
          api.get('/portfolio'),
          api.get('/transactions?limit=5')
        ]);
        setPortfolio(portRes.data);
        setTransactions(txRes.data.transactions || []);
        dispatch(updateBalance());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Portfolio Value',
      data: [100000, 102000, 98500, 105000, 108000, portfolio?.netWorth || 100000, portfolio?.netWorth || 100000],
      borderColor: '#1a56db',
      backgroundColor: 'rgba(26, 86, 219, 0.06)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#1a56db',
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 } } },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { callback: v => '$' + (v / 1000).toFixed(0) + 'k', font: { family: 'DM Mono', size: 11 } }
      }
    }
  };

  if (loading) return <Layout title="Dashboard"><div className="loading-spinner"><div className="spinner" /><span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading dashboard...</span></div></Layout>;

  const pnlColor = portfolio?.totalPnL >= 0 ? 'var(--success)' : 'var(--danger)';

  return (
    <Layout title={`Good day, ${user?.name?.split(' ')[0]} 👋`} subtitle="Here's your trading overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Virtual Balance</div>
          <div className="stat-value">{formatCurrency(user?.virtualBalance)}</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Available cash</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">{formatCurrency(portfolio?.currentValue)}</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>{portfolio?.holdings?.length || 0} holdings</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total P&L</div>
          <div className="stat-value" style={{ color: pnlColor }}>{formatCurrency(portfolio?.totalPnL)}</div>
          <div className="stat-change" style={{ color: pnlColor }}>{formatPercent(portfolio?.totalPnLPercent)} all time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Worth</div>
          <div className="stat-value">{formatCurrency(portfolio?.netWorth)}</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Cash + Portfolio</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card grid-full">
          <div className="card-header" style={{ paddingBottom: 0 }}>
            <div className="card-title">Portfolio Performance</div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/stocks')}>Trade Now</button>
          </div>
          <div className="card-body">
            <div style={{ height: 240 }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Holdings</div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/portfolio')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: '12px 0 0' }}>
            {portfolio?.holdings?.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <div className="empty-icon">📊</div>
                <div className="empty-title">No holdings yet</div>
                <div className="empty-desc">Buy your first stock to start building your portfolio</div>
              </div>
            ) : portfolio?.holdings?.slice(0, 5).map(h => (
              <div key={h.symbol} style={{ display: 'flex', alignItems: 'center', padding: '10px 24px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: 'var(--primary)', marginRight: 12, flexShrink: 0 }}>
                  {h.symbol.slice(0, 3)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{h.symbol}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.quantity} shares</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--mono)' }}>{formatCurrency(h.currentValue)}</div>
                  <div style={{ fontSize: 12, color: h.pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Transactions</div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/transactions')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: '12px 0 0' }}>
            {transactions.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <div className="empty-icon">📋</div>
                <div className="empty-title">No transactions yet</div>
                <div className="empty-desc">Your trade history will appear here</div>
              </div>
            ) : transactions.map(tx => (
              <div key={tx._id} style={{ display: 'flex', alignItems: 'center', padding: '10px 24px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: tx.type === 'BUY' ? 'var(--success-bg)' : 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 12, flexShrink: 0 }}>
                  {tx.type === 'BUY' ? '📈' : '📉'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{tx.symbol} <span className={`badge ${tx.type === 'BUY' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>{tx.type}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDateTime(tx.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--mono)' }}>{formatCurrency(tx.total)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.quantity} @ {formatCurrency(tx.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
