import { pollIntroText } from '../lib/pollIntro';
import type { Poll } from '../types/api';

export function participateKindLabel(poll: Pick<Poll, 'kind'>): string {
  return (poll.kind ?? 'vote') === 'form' ? '인터뷰 폼' : '투표';
}

export function participateFallbackSummary(poll: Pick<Poll, 'kind'>): string {
  return (poll.kind ?? 'vote') === 'form'
    ? '응답을 보내려면 아래에서 참여자 확인이 필요합니다.'
    : '투표에 참여하려면 아래에서 참여자 확인이 필요합니다.';
}

export function participateSummary(poll: Pick<Poll, 'kind' | 'description' | 'subtitle'>): string {
  return pollIntroText(poll) || participateFallbackSummary(poll);
}

export function participateBadges(poll: Pick<Poll, 'poll_type' | 'verify_method' | 'identity_mode' | 'kind'>): string[] {
  const badges: string[] = [];
  if ((poll.poll_type ?? 'open') === 'restricted') {
    badges.push((poll.verify_method ?? 'pin') === 'sso' ? '회사 계정 확인' : '본인 확인');
  } else {
    badges.push('공개 참여');
  }
  if ((poll.kind ?? 'vote') !== 'form' && (poll.identity_mode ?? 'secret') === 'secret' && poll.poll_type === 'restricted') {
    badges.push('무기명');
  }
  return badges;
}

interface PollGateIntroProps {
  kindLabel: string;
  title: string;
  summary: string;
  badges?: string[];
}

/** Shown above SSO / PIN gates so QR visitors know what they are joining. */
export function PollGateIntro({ kindLabel, title, summary, badges = [] }: PollGateIntroProps) {
  return (
    <header className="poll-gate-intro">
      <span className="eyebrow">{kindLabel}</span>
      <h1 className="poll-gate-title">{title}</h1>
      <p className="poll-gate-summary">{summary}</p>
      {badges.length > 0 && (
        <ul className="poll-gate-badges" aria-label="참여 조건">
          {badges.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </header>
  );
}
