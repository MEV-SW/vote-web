import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken } from '../lib/auth';

/** App access requires a company (Keycloak) token. */
export function AuthGuard() {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
