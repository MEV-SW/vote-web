import { Navigate } from 'react-router-dom';

/** @deprecated 허브 관리 탭으로 통합. 북마크 호환용. */
export function ManagePage() {
  return <Navigate to="/?tab=manage" replace />;
}
