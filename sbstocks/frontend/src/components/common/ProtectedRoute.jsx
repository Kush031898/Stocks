import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ children }) {
  const { user } = useSelector(s => s.auth);
  return user ? children : <Navigate to="/login" />;
}

export function AdminRoute({ children }) {
  const { user } = useSelector(s => s.auth);
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

export function GuestRoute({ children }) {
  const { user } = useSelector(s => s.auth);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  return children;
}
