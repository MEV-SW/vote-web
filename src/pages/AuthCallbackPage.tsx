import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeOidcToken } from '../api/admin';
import { verifySso } from '../api/polls';
import { ApiError } from '../api/client';
import { postLoginPath, setToken } from '../lib/auth';
import { setBallotToken } from '../lib/ballotToken';
import { completeSsoLogin } from '../lib/oidc';
import { setVoterSession } from '../lib/voterToken';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user, state } = await completeSsoLogin();
        if (cancelled) return;
        const access = user.access_token;
        if (state.purpose === 'voter' && state.pollId) {
          const res = await verifySso(state.pollId, access);
          if (res.ballot_token) setBallotToken(state.pollId, res.ballot_token);
          if (res.voter_token) setVoterSession(state.pollId, res.voter_token, res.voter_name);
          navigate(state.returnTo || `/polls/${state.pollId}`, { replace: true });
          return;
        }
        const { access_token } = await exchangeOidcToken(access);
        setToken(access_token);
        const saved = sessionStorage.getItem('vote_login_return');
        sessionStorage.removeItem('vote_login_return');
        navigate(postLoginPath(state.returnTo || saved), { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : '회사 계정 로그인에 실패했습니다.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
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
