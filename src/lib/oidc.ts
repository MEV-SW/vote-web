import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { getAuthConfig } from '../api/admin';
import type { AuthConfig } from '../types/api';

let cachedConfig: AuthConfig | null = null;
let manager: UserManager | null = null;

export async function loadAuthConfig(): Promise<AuthConfig> {
  if (!cachedConfig) cachedConfig = await getAuthConfig();
  return cachedConfig;
}

export function getOidcManager(cfg: AuthConfig): UserManager | null {
  if (!cfg.oidc_enabled || !cfg.issuer || !cfg.client_id) return null;
  if (manager) return manager;
  manager = new UserManager({
    authority: cfg.issuer.replace(/\/$/, ''),
    client_id: cfg.client_id,
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri: window.location.origin,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  });
  return manager;
}

export async function startSsoLogin(purpose: 'admin' | 'voter', pollId?: number) {
  const cfg = await loadAuthConfig();
  const um = getOidcManager(cfg);
  if (!um) throw new Error('회사 계정 로그인이 설정되지 않았습니다.');
  await um.signinRedirect({
    state: JSON.stringify({
      purpose,
      pollId,
      returnTo: window.location.pathname + window.location.search,
    }),
  });
}

export async function completeSsoLogin() {
  const cfg = await loadAuthConfig();
  const um = getOidcManager(cfg);
  if (!um) throw new Error('회사 계정 로그인이 설정되지 않았습니다.');
  const user = await um.signinRedirectCallback();
  let state: { purpose?: string; pollId?: number; returnTo?: string } = {};
  try {
    state = typeof user.state === 'string' ? JSON.parse(user.state) : (user.state as typeof state) ?? {};
  } catch {
    state = {};
  }
  return { user, state };
}
