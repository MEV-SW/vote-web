import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { JoinPanel, type JoinPanelMeta } from '../components/JoinPanel';
import { ManagePanel, type ManagePanelMeta } from '../components/ManagePanel';
import { clearToken } from '../lib/auth';

export type HubTab = 'join' | 'manage';

function parseTab(raw: string | null): HubTab {
  return raw === 'manage' ? 'manage' : 'join';
}

export function HubPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = useMemo(() => parseTab(params.get('tab')), [params]);
  const [creating, setCreating] = useState(false);
  const [joinMeta, setJoinMeta] = useState<JoinPanelMeta | null>(null);
  const [manageMeta, setManageMeta] = useState<ManagePanelMeta | null>(null);

  const setTab = (next: HubTab) => {
    setParams(next === 'join' ? {} : { tab: next }, { replace: true });
  };

  const logout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  const joinBadge = joinMeta?.active ?? 0;
  const manageBadge = manageMeta?.active ?? 0;

  return (
    <AppShell className="hub-shell">
      <div className="hub-page">
        <div className="hub-top-shell hub-surface rounded-[20px]">
          <header className="hub-top">
            <div className="hub-brand">
              <span className="hub-brand-name">MotrexEV</span>
              <span className="hub-brand-sub">Vote · 투표 시스템</span>
            </div>
            <nav className="hub-tabs" aria-label="참여 또는 관리">
              <button
                type="button"
                className={`hub-tab${tab === 'join' ? ' is-active' : ''}`}
                aria-current={tab === 'join' ? 'page' : undefined}
                onClick={() => setTab('join')}
              >
                <span className="hub-tab-main">
                  <span className="hub-tab-label">참여</span>
                  {joinBadge > 0 && <span className="hub-tab-badge">{joinBadge}</span>}
                </span>
                <span className="hub-tab-hint">투표·폼 참여</span>
              </button>
              <button
                type="button"
                className={`hub-tab${tab === 'manage' ? ' is-active' : ''}`}
                aria-current={tab === 'manage' ? 'page' : undefined}
                onClick={() => setTab('manage')}
              >
                <span className="hub-tab-main">
                  <span className="hub-tab-label">관리</span>
                  {manageBadge > 0 && <span className="hub-tab-badge">{manageBadge}</span>}
                </span>
                <span className="hub-tab-hint">만들기·운영</span>
              </button>
            </nav>
            <button type="button" className="btn btn-ghost btn-sm hub-logout" onClick={logout}>
              로그아웃
            </button>
          </header>
        </div>

        <section className="hub-intro hub-surface rounded-[20px]" aria-labelledby="hub-intro-title">
          <div className="hub-intro-inner">
            <div className="hub-intro-copy">
              {tab === 'join' ? (
                <>
                  <h1 id="hub-intro-title" className="hub-title">
                    참여할 투표
                  </h1>
                  <p className="hub-sub">
                    진행 중인 투표·폼에 참여하거나, 종료된 항목의 결과를 확인합니다.
                  </p>
                  {joinMeta && joinMeta.total > 0 && (
                    <p className="hub-meta-line">
                      진행 {joinMeta.active} · 종료 {joinMeta.closed}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h1 id="hub-intro-title" className="hub-title">
                    내가 만든 투표
                  </h1>
                  <p className="hub-sub">
                    생성한 투표·폼의 상태, QR, 결과를 한곳에서 관리합니다.
                  </p>
                  {manageMeta && manageMeta.total > 0 && (
                    <p className="hub-meta-line">
                      전체 {manageMeta.total} · 진행 {manageMeta.active} · 누적{' '}
                      {manageMeta.ballots.toLocaleString()}표
                    </p>
                  )}
                </>
              )}
            </div>
            {tab === 'manage' && (
              <button
                type="button"
                className="btn btn-primary hub-intro-action"
                onClick={() => setCreating(true)}
              >
                ＋ 새 투표 만들기
              </button>
            )}
          </div>
        </section>

        <div className="hub-body" key={tab}>
          {tab === 'join' ? (
            <JoinPanel onMetaUpdate={setJoinMeta} />
          ) : (
            <ManagePanel
              createOpen={creating}
              onCreateOpenChange={setCreating}
              onMetaUpdate={setManageMeta}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
