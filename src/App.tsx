import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GlassFilter } from '@/components/ui/liquid-glass';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { AuthGuard } from './pages/AuthGuard';
import { CompletePage } from './pages/CompletePage';
import { DotPatternDemoPage } from './pages/DotPatternDemoPage';
import { HubPage } from './pages/HubPage';
import { PublicResultsPage } from './pages/PublicResultsPage';
import { VotePage } from './pages/VotePage';
import { EditPollPage } from './pages/admin/EditPollPage';
import { LoginPage } from './pages/admin/LoginPage';
import { FormLayoutDemoPage } from './pages/FormLayoutDemoPage';
import { LiquidGlassDemoPage } from './pages/LiquidGlassDemoPage';
import { ResultsPage } from './pages/admin/ResultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <GlassFilter />
      <div className="app-root">
        <Routes>
          <Route path="/demo/liquid-glass" element={<LiquidGlassDemoPage />} />
          <Route path="/demo/form-layout" element={<FormLayoutDemoPage />} />
          <Route path="/demo/dot-pattern" element={<DotPatternDemoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          <Route path="/polls/:pollId/results" element={<PublicResultsPage />} />
          <Route path="/polls/:pollId" element={<VotePage />} />
          <Route path="/polls/:pollId/complete" element={<CompletePage />} />

          <Route element={<AuthGuard />}>
            <Route path="/" element={<HubPage />} />
            <Route path="/admin" element={<Navigate to="/?tab=manage" replace />} />
            <Route path="/admin/polls/:pollId/results" element={<ResultsPage />} />
            <Route path="/admin/polls/:pollId/edit" element={<EditPollPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
