import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GlassEffect, LIQUID_GLASS_BG } from '@/components/ui/liquid-glass';
import { login } from '../../api/admin';
import { ApiError } from '../../api/client';
import { getToken, postLoginPath, setToken } from '../../lib/auth';
import { loadAuthConfig } from '../../lib/oidc';
import type { AuthConfig } from '../../types/api';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const dest = postLoginPath(from);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    return <Navigate to={dest} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { access_token } = await login(username, password);
      setToken(access_token);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const keycloakReady = Boolean(authCfg?.oidc_enabled);
  const canSubmit = keycloakReady && !loadingCfg && !cfgError;

  return (
    <div
      className="login-page login-page--glass"
      style={{ backgroundImage: `url("${LIQUID_GLASS_BG}")` }}
    >
      <div className="login-stage">
        <div className="login-brand-block">
          <p className="login-brand">MotrexEV</p>
          <p className="login-product">투표 시스템</p>
        </div>

        <GlassEffect className="w-full max-w-[420px] rounded-[22px]">
          <form className="login-card login-card--glass" onSubmit={onSubmit}>
            <div className="login-card-head">
              <span className="eyebrow">Internal Vote</span>
              <h1>로그인</h1>
              <p className="login-sub">
                MotrexEV 구성원 계정으로 투표 참여·관리에 접속합니다.
              </p>
            </div>

            <div className="login-idp" aria-label="인증 방식">
              <span className="login-idp-mark" aria-hidden>
                M
              </span>
              <div className="login-idp-copy">
                <strong>MotrexEV SSO</strong>
                <span>회사 Keycloak으로 아이디·비밀번호를 확인합니다</span>
              </div>
            </div>

            {loadingCfg && <p className="login-sub">설정 불러오는 중…</p>}
            {cfgError && <p className="login-error">{cfgError}</p>}
            {!loadingCfg && !cfgError && !keycloakReady && (
              <p className="login-error">
                MotrexEV 로그인이 설정되지 않았습니다. 관리자에게 문의하세요.
              </p>
            )}

            <label className="cp-field">
              <span className="cp-label">회사 아이디</span>
              <input
                className="cp-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={!canSubmit}
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
                disabled={!canSubmit}
              />
            </label>

            <button type="submit" className="btn btn-primary login-submit" disabled={!canSubmit || loading}>
              {loading ? '확인 중…' : 'MotrexEV로 로그인'}
            </button>

            {error && <p className="login-error">{error}</p>}

            <p className="login-foot">MotrexEV Vote · 내부 전용</p>
          </form>
        </GlassEffect>
      </div>
    </div>
  );
}
