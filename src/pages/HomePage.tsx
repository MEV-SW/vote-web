import { Navigate } from 'react-router-dom';

/** @deprecated 허브 참여 탭으로 통합. */
export function HomePage() {
  return <Navigate to="/?tab=join" replace />;
}
