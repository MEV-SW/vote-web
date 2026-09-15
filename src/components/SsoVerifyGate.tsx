import { useState } from 'react';
import { startSsoLogin } from '../lib/oidc';
import { ApiError } from '../api/client';

interface SsoVerifyGateProps {
  pollId: number;
  kindLabel?: string;
}

export function SsoVerifyGate({ pollId, kindLabel = '참여' }: SsoVerifyGateProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await startSsoLogin('voter', pollId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : '회사 계정 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="verify-gate">
      <span className="eyebrow">Company SSO</span>
      <h2>회사 계정으로 확인</h2>
      <p className="verify-sub">
        {kindLabel}하려면 회사 계정으로 로그인해 주세요. 무기명 투표는 자격만 확인하고, 선택 내용은 계정과 연결되지 않습니다.
      </p>
      {error && <p className="login-error">{error}</p>}
      <button type="button" className="btn btn-primary" onClick={() => void onLogin()} disabled={loading} style={{ width: '100%' }}>
        {loading ? '이동 중…' : '회사 계정으로 계속'}
      </button>
    </div>
  );
}
