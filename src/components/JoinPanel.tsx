import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublicPolls } from '../api/polls';
import { ApiError } from '../api/client';
import type { PollPublicListItem } from '../types/api';

export type JoinPanelMeta = {
  active: number;
  closed: number;
  total: number;
};

const POLL_TYPE_LABEL: Record<string, string> = {
  open: '불특정',
  restricted: '특정 대상',
};

function formatCloses(closesAt?: string | null) {
  if (!closesAt) return '마감 미정';
  return new Date(closesAt).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PollCard({ poll }: { poll: PollPublicListItem }) {
  const active = poll.status === 'active';
  const href = active ? `/polls/${poll.id}` : `/polls/${poll.id}/results`;

  return (
    <Link to={href} className="home-poll-link">
      <article className={`home-poll-card home-poll-card--solid${active ? ' is-active' : ''}`}>
        <div className="home-poll-card-top">
          <span className="home-poll-cat" data-cat={poll.category}>
            {poll.category}
          </span>
          <span className="pill">{poll.kind === 'form' ? '폼' : '투표'}</span>
          {poll.identity_mode === 'secret' && poll.poll_type === 'restricted' && (
            <span className="pill">무기명</span>
          )}
          <span className={`pill${active ? ' pill-live' : ' pill-closed'}`}>
            {active && <span className="dot" />}
            {active ? '진행중' : '종료'}
          </span>
        </div>
        <h2 className="home-poll-title">{poll.title}</h2>
        {poll.desc && <p className="home-poll-desc">{poll.desc}</p>}
        <dl className="home-poll-meta">
          <div>
            <dt>{poll.kind === 'form' ? '문항' : '후보'}</dt>
            <dd>{poll.kind === 'form' ? `${poll.questions ?? 0}개` : `${poll.candidates}명`}</dd>
          </div>
          {poll.kind !== 'form' && (
            <div>
              <dt>선택</dt>
              <dd>{poll.max_selections}순위</dd>
            </div>
          )}
          <div>
            <dt>참여</dt>
            <dd>{poll.ballots.toLocaleString()}표</dd>
          </div>
          <div>
            <dt>대상</dt>
            <dd>{POLL_TYPE_LABEL[poll.poll_type] ?? '불특정'}</dd>
          </div>
        </dl>
        <div className="home-poll-foot">
          <span className="home-poll-closes">{formatCloses(poll.closes_at)}</span>
          <span className="home-poll-cta">
            {active ? (poll.kind === 'form' ? '작성하기 →' : '투표하기 →') : '결과 보기 →'}
          </span>
        </div>
      </article>
    </Link>
  );
}

function JoinSkeleton() {
  return (
    <div className="hub-skeleton-grid" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="hub-skeleton-card" />
      ))}
    </div>
  );
}

/** 허브 「참여」 탭 — 진행중/종료 공개 목록 */
export function JoinPanel({ onMetaUpdate }: { onMetaUpdate?: (meta: JoinPanelMeta) => void }) {
  const [polls, setPolls] = useState<PollPublicListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await listPublicPolls();
        if (!cancelled) setPolls(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : '투표 목록을 불러올 수 없습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activePolls = polls.filter((p) => p.status === 'active');
  const closedPolls = polls.filter((p) => p.status === 'closed');

  useEffect(() => {
    if (loading) return;
    onMetaUpdate?.({
      active: activePolls.length,
      closed: closedPolls.length,
      total: polls.length,
    });
  }, [loading, polls.length, activePolls.length, closedPolls.length, onMetaUpdate]);

  return (
    <div className="join-panel">
      {loading && <JoinSkeleton />}
      {error && <p className="home-error">{error}</p>}

      {!loading && !error && polls.length === 0 && (
        <div className="hub-surface rounded-[20px]">
          <div className="hub-empty hub-empty--glass">
            <div className="hub-empty-icon" aria-hidden>
              🗳
            </div>
            <p className="hub-empty-title">지금 참여할 수 있는 투표가 없어요</p>
            <p className="hub-empty-desc">새 투표가 시작되면 이곳에 표시됩니다. 관리 탭에서 직접 만들 수도 있어요.</p>
          </div>
        </div>
      )}

      {!loading && activePolls.length > 0 && (
        <section className="home-section">
          <div className="home-section-head home-section-head--plain">
            <h2>진행 중</h2>
            <span className="home-section-count">{activePolls.length}</span>
          </div>
          <div className="home-poll-grid">
            {activePolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </section>
      )}

      {!loading && closedPolls.length > 0 && (
        <section className="home-section home-section--closed">
          <div className="home-section-head home-section-head--plain">
            <h2>종료됨</h2>
            <span className="home-section-count">{closedPolls.length}</span>
          </div>
          <div className="home-poll-grid">
            {closedPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
