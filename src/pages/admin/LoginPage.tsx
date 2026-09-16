import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../api/admin';
import { ApiError } from '../../api/client';
import { getToken, setToken } from '../../lib/auth';
import { loadAuthConfig, startSsoLogin } from '../../lib/oidc';
import type { AuthConfig } from '../../types/api';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [authCfg, setAuthCfg] = useState<AuthConfig | null>(null);
  const [loadingCfg, setLoadingCfg] = useState(true);
  const [cfgError, setCfgError] = useState('');

  useEffect(() => {
    void loadAuthConfig()
      .then((cfg) => {
        setAuthCfg(cfg);
        setCfgError('');
      })
      .catch((err) => {
        setAuthCfg(null);
        setCfgError(
          err instanceof ApiError
            ? `인증 설정을 불러오지 못했습니다 (${err.status}). Vote API가 실행 중인지 확인하세요.`
            : '인증 설정을 불러오지 못했습니다. Vote API 연결을 확인하세요.',
        );
      })
      .finally(() => setLoadingCfg(false));
  }, []);

  if (getToken()) {
    return <Navigate to={from.startsWith('/login') ? '/' : from} replace />;
  }

  const goAfterLogin = (accessToken: string) => {
    setToken(accessToken);
    const dest = from.startsWith('/login') ? '/' : from;
    navigate(dest, { replace: true });
  };

  const onSso = async () => {
    setSsoLoading(true);
    setError('');
    try {
      sessionStorage.setItem('vote_login_return', from);
      await startSsoLogin('admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회사 계정 로그인에 실패했습니다.');
      setSsoLoading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { access_token } = await login(username, password);
      goAfterLogin(access_token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const showSso = Boolean(authCfg?.oidc_enabled);
  const showPassword = true;

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <span className="eyebrow">Vote</span>
        <h1>로그인</h1>
        <p className="login-sub">회사 계정으로 이용합니다. 브라우저 로그인 또는 아이디·비밀번호.</p>
        {loadingCfg && <p className="login-sub">설정 불러오는 중…</p>}
        {cfgError && <p className="login-error">{cfgError}</p>}

        {showSso && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={ssoLoading}
            onClick={() => void onSso()}
            style={{ width: '100%' }}
          >
            {ssoLoading ? '이동 중…' : '회사 계정으로 로그인'}
          </button>
        )}

        {showSso && showPassword && (
          <p className="login-sub" style={{ textAlign: 'center', margin: '12px 0' }}>
            또는
          </p>
        )}

        {showPassword && (
          <>
            <label className="cp-field">
              <span className="cp-label">아이디</span>
              <input
                className="cp-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label className="cp-field">
              <span className="cp-label">비밀번호</span>
              <input
                className="cp-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? '로그인 중…' : '아이디로 로그인'}
            </button>
          </>
        )}

        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}
