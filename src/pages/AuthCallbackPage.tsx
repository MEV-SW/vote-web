import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifySso } from '../api/polls';
import { ApiError } from '../api/client';
import { setToken } from '../lib/auth';
import { setBallotToken } from '../lib/ballotToken';
import { completeSsoLogin } from '../lib/oidc';
import { setVoterSession } from '../lib/voterToken';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { user, state } = await completeSsoLogin();
        const access = user.access_token;
        if (state.purpose === 'voter' && state.pollId) {
          const res = await verifySso(state.pollId, access);
          if (res.ballot_token) setBallotToken(state.pollId, res.ballot_token);
          if (res.voter_token) setVoterSession(state.pollId, res.voter_token, res.voter_name);
          navigate(state.returnTo || `/polls/${state.pollId}`, { replace: true });
          return;
        }
        setToken(access);
        navigate(state.returnTo?.startsWith('/admin') ? state.returnTo : '/admin', { replace: true });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : '회사 계정 로그인에 실패했습니다.');
      }
    })();
  }, [navigate]);

  if (error) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>로그인 실패</h1>
          <p className="login-error">{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <p>회사 계정 확인 중…</p>
      </div>
    </div>
  );
}
