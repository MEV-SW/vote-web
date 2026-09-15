import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/admin';
import { setToken } from '../../lib/auth';
import { loadAuthConfig, startSsoLogin } from '../../lib/oidc';
import { ApiError } from '../../api/client';
import type { AuthConfig } from '../../types/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [authCfg, setAuthCfg] = useState<AuthConfig | null>(null);

  useEffect(() => {
    void loadAuthConfig().then(setAuthCfg).catch(() => setAuthCfg(null));
  }, []);

  const onSso = async () => {
    setSsoLoading(true);
    setError('');
    try {
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
      setToken(access_token);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <span className="eyebrow">Admin</span>
        <h1>로그인</h1>
        <p className="login-sub">회사 계정으로 들어오면 내가 만든 투표·폼만 관리합니다.</p>
        {authCfg?.oidc_enabled && (
          <>
            <button type="button" className="btn btn-primary" disabled={ssoLoading} onClick={() => void onSso()} style={{ width: '100%' }}>
              {ssoLoading ? '이동 중…' : '회사 계정으로 로그인'}
            </button>
            {authCfg.local_enabled && <p className="login-sub" style={{ textAlign: 'center' }}>또는</p>}
          </>
        )}
        {authCfg?.local_enabled !== false && (
          <>
            <label className="cp-field">
              <span className="cp-label">아이디</span>
              <input className="cp-input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </label>
            <label className="cp-field">
              <span className="cp-label">비밀번호</span>
              <input className="cp-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? '로그인 중…' : '로그인'}
            </button>
          </>
        )}
        {error && authCfg?.local_enabled === false && <p className="login-error">{error}</p>}
        <Link to="/" className="login-home-link">← 투표 목록으로</Link>
      </form>
    </div>
  );
}
