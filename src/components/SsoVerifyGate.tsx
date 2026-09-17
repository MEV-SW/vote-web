import { useEffect, useRef, useState } from 'react';
import { verifySso } from '../api/polls';
import { ApiError } from '../api/client';
import { getToken } from '../lib/auth';
import { startSsoLogin } from '../lib/oidc';
import type { VerifyVoterResponse } from '../types/api';
import { PollGateIntro } from './PollGateIntro';

interface SsoVerifyGateProps {
  pollId: number;
  kindLabel?: string;
  title: string;
  summary: string;
  badges?: string[];
  onVerified: (token: string, name: string, ballotToken?: string | null) => void;
}

export function SsoVerifyGate({
  pollId,
  kindLabel = '참여',
  title,
  summary,
  badges = [],
  onVerified,
}: SsoVerifyGateProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const applied = useRef(false);

  const applyResult = (res: VerifyVoterResponse) => {
    if (applied.current) return;
    applied.current = true;
    if (res.ballot_token) {
      onVerified(res.voter_token ?? '', res.voter_name, res.ballot_token);
      return;
    }
    if (res.voter_token) {
      onVerified(res.voter_token, res.voter_name);
      return;
    }
    onVerified('', res.voter_name, null);
  };

  useEffect(() => {
    const session = getToken();
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await verifySso(pollId, session);
        if (!cancelled) applyResult(res);
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setError(
            err instanceof ApiError
              ? err.message
              : '세션으로 확인할 수 없습니다. 회사 계정으로 계속해 주세요.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot session reuse
  }, [pollId]);

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

  if (loading && getToken() && !error) {
    return (
      <div className="verify-gate">
        <PollGateIntro kindLabel={kindLabel} title={title} summary={summary} badges={badges} />
        <div className="verify-gate-action">
          <span className="eyebrow">Company SSO</span>
          <h2>회사 계정 확인 중…</h2>
          <p className="verify-sub">이미 로그인된 세션으로 자격을 확인하고 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-gate">
      <PollGateIntro kindLabel={kindLabel} title={title} summary={summary} badges={badges} />
      <div className="verify-gate-action">
        <span className="eyebrow">Company SSO</span>
        <h2>회사 계정으로 확인</h2>
        <p className="verify-sub">
          {kindLabel}에 참여하려면 회사 계정으로 로그인해 주세요. 무기명인 경우 자격만 확인하고 선택 내용은 계정과 연결되지 않습니다.
        </p>
        {error && <p className="login-error">{error}</p>}
        <button type="button" className="btn btn-primary" onClick={() => void onLogin()} disabled={loading} style={{ width: '100%' }}>
          {loading ? '이동 중…' : '회사 계정으로 계속'}
        </button>
      </div>
    </div>
  );
}
