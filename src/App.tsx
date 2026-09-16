import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { AuthGuard } from './pages/AuthGuard';
import { CompletePage } from './pages/CompletePage';
import { HomePage } from './pages/HomePage';
import { PublicResultsPage } from './pages/PublicResultsPage';
import { VotePage } from './pages/VotePage';
import { EditPollPage } from './pages/admin/EditPollPage';
import { LoginPage } from './pages/admin/LoginPage';
import { ManagePage } from './pages/admin/ManagePage';
import { ResultsPage } from './pages/admin/ResultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          <Route element={<AuthGuard />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/polls/:pollId/results" element={<PublicResultsPage />} />
            <Route path="/polls/:pollId" element={<VotePage />} />
            <Route path="/polls/:pollId/complete" element={<CompletePage />} />
            <Route path="/admin" element={<ManagePage />} />
            <Route path="/admin/polls/:pollId/results" element={<ResultsPage />} />
            <Route path="/admin/polls/:pollId/edit" element={<EditPollPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
