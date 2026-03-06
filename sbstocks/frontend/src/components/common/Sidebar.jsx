import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { formatCurrency, getInitials } from '../../utils/format';

const Icon = ({ name }) => {
  const icons = {
    dashboard: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    stocks: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    portfolio: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    transactions: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
    watchlist: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    admin: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    logout: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return icons[name] || null;
};

const NavItem = ({ icon, label, path, active, onClick }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <Icon name={icon} />
    <span>{label}</span>
  </div>
);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'stocks', label: 'Markets', path: '/stocks' },
    { icon: 'portfolio', label: 'Portfolio', path: '/portfolio' },
    { icon: 'transactions', label: 'Transactions', path: '/transactions' },
    { icon: 'watchlist', label: 'Watchlist', path: '/watchlist' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">SB</div>
          <div>
            <div className="logo-text">SB Stocks</div>
            <div className="logo-sub">PAPER TRADING</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavItem
            key={item.path}
            {...item}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label">Administration</div>
            <NavItem
              icon="admin" label="Admin Panel" path="/admin"
              active={location.pathname.startsWith('/admin')}
              onClick={() => navigate('/admin')}
            />
          </>
        )}
        <div className="nav-section-label">Account</div>
        <NavItem icon="logout" label="Sign Out" onClick={handleLogout} />
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" onClick={() => navigate('/profile')}>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Trader'}</div>
            <div className="user-balance">{formatCurrency(user?.virtualBalance)}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
