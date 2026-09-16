import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../../lib/auth';

export function AdminGuard() {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
