const TOKEN_KEY = 'vote_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 로그인 후 이동.
 * - `/admin/...` 편집·결과 등만 그대로 복귀
 * - `/admin` · 그 외 → 허브 참여 탭
 */
export function postLoginPath(from?: string | null): string {
  if (!from) return '/?tab=join';
  const path = from.split('?')[0] || '';
  if (path === '/admin' || path === '/admin/login' || path.startsWith('/admin/login')) {
    return '/?tab=manage';
  }
  if (path.startsWith('/admin/')) {
    return from.startsWith('/') ? from : '/?tab=manage';
  }
  if (path === '/' || path === '') {
    const q = from.includes('?') ? from.slice(from.indexOf('?')) : '';
    if (q.includes('tab=manage')) return '/?tab=manage';
    return '/?tab=join';
  }
  return '/?tab=join';
}
