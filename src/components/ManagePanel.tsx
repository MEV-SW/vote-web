import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPoll, deletePoll, listPolls, updatePoll } from '../api/admin';
import { ConfirmDialog } from './ConfirmDialog';
import { ResultsModeDialog } from './ResultsModeDialog';
import { CreatePollModal } from './CreatePollModal';
import { QrCodeModal } from './QrCodeModal';
import { PtBtn } from './PtBtn';
import { QrOpenButton } from './QrOpenButton';
import { getToken, clearToken } from '../lib/auth';
import { useMediaQuery } from '../lib/useMediaQuery';
import type { PollListItem } from '../types/api';
import { ApiError } from '../api/client';
import { hasSelectionMismatch, selectionMismatchMessage } from '../lib/pollWarnings';

const POLL_TYPE_LABEL: Record<string, string> = {
  open: '불특정',
  restricted: '특정',
};

const STATUS_META: Record<string, { label: string; cls: string; dot: boolean }> = {
  active: { label: '진행중', cls: 'st-active', dot: true },
  draft: { label: '준비중', cls: 'st-draft', dot: false },
  closed: { label: '종료', cls: 'st-closed', dot: false },
};

function nextStatus(s: string) {
  if (s === 'draft') return 'active';
  if (s === 'active') return 'closed';
  return 'active';
}

function statusAction(s: string): { label: string; variant: 'start' | 'stop' | 'reopen'; icon: string } {
  if (s === 'draft') return { label: '시작', variant: 'start', icon: '▶' };
  if (s === 'active') return { label: '종료', variant: 'stop', icon: '■' };
  return { label: '재개', variant: 'reopen', icon: '↻' };
}

export type ManagePanelMeta = {
  total: number;
  active: number;
  ballots: number;
};

function ManageSkeleton() {
  return (
    <div className="hub-skeleton-table" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="hub-skeleton-row" />
      ))}
    </div>
  );
}

interface ManagePanelProps {
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
  onMetaUpdate?: (meta: ManagePanelMeta) => void;
}

/** 허브 「관리」 탭 — 내가 만든 투표 */
export function ManagePanel({ createOpen, onCreateOpenChange, onMetaUpdate }: ManagePanelProps) {
  const navigate = useNavigate();
  const token = getToken()!;
  const isDesktop = useMediaQuery('(min-width: 861px)');
  const [polls, setPolls] = useState<PollListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingInternal, setCreatingInternal] = useState(false);
  const creating = createOpen ?? creatingInternal;
  const setCreating = onCreateOpenChange ?? setCreatingInternal;
  const [qrPoll, setQrPoll] = useState<{ id: number; title: string } | null>(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PollListItem | null>(null);
  const [resultsPick, setResultsPick] = useState<{ id: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPolls(await listPolls(token));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        clearToken();
        navigate('/login', { replace: true });
      } else if (e instanceof ApiError && e.status === 403) {
        setError(e.message || '접근 권한이 없습니다.');
      } else {
        setError('목록을 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePoll(token, deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      setError('투표 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const cycle = async (id: number, current: string) => {
    try {
      await updatePoll(token, id, { status: nextStatus(current) });
      await load();
    } catch {
      setError('상태 변경에 실패했습니다.');
    }
  };

  const activeCount = polls.filter((p) => p.status === 'active').length;
  const totalBallots = polls.reduce((s, p) => s + p.ballots, 0);

  useEffect(() => {
    if (loading) return;
    onMetaUpdate?.({
      total: polls.length,
      active: activeCount,
      ballots: totalBallots,
    });
  }, [loading, polls.length, activeCount, totalBallots, onMetaUpdate]);

  return (
    <div className="manage-panel">
      {error && <p className="manage-panel-error">{error}</p>}

      {!loading && polls.length > 0 && (
        <div className="manage-stats-glass hub-surface rounded-[20px]">
          <div className="manage-stats manage-stats--glass">
            <div className="mstat">
              <div className="mstat-v">{polls.length}</div>
              <div className="mstat-k">내 항목</div>
            </div>
            <div className="mstat">
              <div className="mstat-v">{activeCount}</div>
              <div className="mstat-k">진행중</div>
            </div>
            <div className="mstat">
              <div className="mstat-v">{totalBallots.toLocaleString()}</div>
              <div className="mstat-k">누적 참여 표</div>
            </div>
            <div className="mstat">
              <div className="mstat-v">{polls.filter((p) => p.status === 'draft').length}</div>
              <div className="mstat-k">준비중</div>
            </div>
          </div>
        </div>
      )}

      {loading && <ManageSkeleton />}

      {!loading && polls.length === 0 && (
        <div className="hub-surface rounded-[20px]">
          <div className="hub-empty hub-empty--glass">
            <div className="hub-empty-icon" aria-hidden>
              ✦
            </div>
            <p className="hub-empty-title">아직 만든 투표가 없어요</p>
            <p className="hub-empty-desc">첫 투표를 만들면 QR 공유, 상태 변경, 결과 확인을 바로 시작할 수 있습니다.</p>
            <button type="button" className="btn btn-primary hub-empty-action" onClick={() => setCreating(true)}>
              ＋ 새 투표 만들기
            </button>
          </div>
        </div>
      )}

      {!loading && polls.length > 0 && isDesktop && (
        <div className="manage-desktop-table">
          <div className="manage-table-glass hub-surface rounded-[20px] w-full">
            <div className="poll-table-wrap poll-table-wrap--glass">
              <table className="poll-table">
                <colgroup>
                  <col className="pt-col pt-col--poll" />
                  <col className="pt-col pt-col--type" />
                  <col className="pt-col pt-col--status" />
                  <col className="pt-col pt-col--cand" />
                  <col className="pt-col pt-col--part" />
                  <col className="pt-col pt-col--qr" />
                  <col className="pt-col pt-col--actions" />
                </colgroup>
                <thead>
                  <tr>
                    <th>투표</th>
                    <th>타입</th>
                    <th>상태</th>
                    <th>후보</th>
                    <th>참여</th>
                    <th>QR</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {polls.map((p) => {
                    const sm = STATUS_META[p.status] ?? STATUS_META.draft;
                    const rate = p.ballots ? Math.round((p.ballots / Math.max(p.eligible, 1)) * 100) : 0;
                    const created = new Date(p.created_at).toLocaleDateString('ko-KR');
                    const closes = p.closes_at ? new Date(p.closes_at).toLocaleDateString('ko-KR') : '미정';
                    const maxSel = p.max_selections ?? 3;
                    const selectionWarn = p.kind !== 'form' && hasSelectionMismatch(p.candidates, maxSel);
                    const a = statusAction(p.status);
                    return (
                      <tr key={p.id} className={p.status === 'closed' ? 'is-closed' : undefined}>
                        <td>
                          <div className="pt-poll-inner">
                            <div className="pt-cat" data-cat={p.category}>{p.category}</div>
                            <div className="pt-titles">
                              <Link to={`/polls/${p.id}/results`} className="pt-title pt-title-link">
                                {p.title}
                              </Link>
                              <div className="pt-meta">
                                #{p.id} · {p.kind === 'form' ? '폼' : '투표'} · 생성 {created} · 마감 {closes}
                              </div>
                              {selectionWarn && (
                                <div className="pt-warn" title={selectionMismatchMessage(p.candidates, maxSel)}>
                                  ⚠ 선택 {maxSel}명 · 후보 {p.candidates}명
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`pill pt-type-pill pt-type--${p.poll_type || 'open'}`}>
                            {POLL_TYPE_LABEL[p.poll_type] ?? '불특정'}
                          </span>
                        </td>
                        <td>
                          <span className={`pill st-pill ${sm.cls}`}>
                            {sm.dot && <span className="dot" />}
                            {sm.label}
                          </span>
                        </td>
                        <td>
                          <b>{p.kind === 'form' ? (p.questions ?? 0) : p.candidates}</b>
                          <span>{p.kind === 'form' ? '문항' : '명'}</span>
                        </td>
                        <td>
                          <div className="pt-part-inner">
                            <div>
                              <b>{p.ballots.toLocaleString()}</b>
                              <span>표 · {rate}%</span>
                            </div>
                            <div className="pt-bar">
                              <i style={{ width: `${rate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <QrOpenButton onClick={() => setQrPoll({ id: p.id, title: p.title })} />
                        </td>
                        <td>
                          <div className="pt-actions-inner">
                            <PtBtn variant={a.variant} icon={a.icon} label={a.label} onClick={() => void cycle(p.id, p.status)} />
                            <PtBtn variant="ghost" icon="📊" label="결과" onClick={() => setResultsPick({ id: p.id, title: p.title })} />
                            <PtBtn variant="ghost" icon="✎" label="수정" to={`/admin/polls/${p.id}/edit`} />
                            <PtBtn
                              variant="delete"
                              icon="🗑"
                              label="삭제"
                              title="투표 삭제"
                              disabled={deleting}
                              onClick={() => setDeleteTarget(p)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && polls.length > 0 && !isDesktop && (
        <div className="manage-mobile-cards">
          {polls.map((p) => {
            const sm = STATUS_META[p.status] ?? STATUS_META.draft;
            const rate = p.ballots ? Math.round((p.ballots / Math.max(p.eligible, 1)) * 100) : 0;
            const created = new Date(p.created_at).toLocaleDateString('ko-KR');
            const closes = p.closes_at ? new Date(p.closes_at).toLocaleDateString('ko-KR') : '미정';
            const a = statusAction(p.status);
            return (
              <article
                key={p.id}
                className={`manage-card${p.status === 'closed' ? ' is-closed' : ''}`}
              >
                <header className="manage-card-head">
                  <div className="manage-card-tags">
                    <span className="pt-cat" data-cat={p.category}>{p.category}</span>
                    <span className={`pill pt-type-pill pt-type--${p.poll_type || 'open'}`}>
                      {POLL_TYPE_LABEL[p.poll_type] ?? '불특정'}
                    </span>
                    <span className={`pill st-pill ${sm.cls}`}>
                      {sm.dot && <span className="dot" />}
                      {sm.label}
                    </span>
                  </div>
                  <h3 className="manage-card-title">
                    <Link to={`/polls/${p.id}/results`}>{p.title}</Link>
                  </h3>
                  <p className="manage-card-meta">
                    #{p.id} · {p.kind === 'form' ? '폼' : '투표'} · 생성 {created} · 마감 {closes}
                  </p>
                </header>

                <div className="manage-card-stats">
                  <div>
                    <span className="manage-card-stat-k">{p.kind === 'form' ? '문항' : '후보'}</span>
                    <strong>
                      {p.kind === 'form' ? (p.questions ?? 0) : p.candidates}
                      <em>{p.kind === 'form' ? '개' : '명'}</em>
                    </strong>
                  </div>
                  <div>
                    <span className="manage-card-stat-k">참여</span>
                    <strong>
                      {p.ballots.toLocaleString()}
                      <em>표 · {rate}%</em>
                    </strong>
                    <div className="pt-bar manage-card-bar">
                      <i style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                </div>

                <div className="manage-card-actions">
                  <QrOpenButton onClick={() => setQrPoll({ id: p.id, title: p.title })} />
                  <PtBtn variant={a.variant} icon={a.icon} label={a.label} onClick={() => void cycle(p.id, p.status)} />
                  <PtBtn variant="ghost" icon="📊" label="결과" onClick={() => setResultsPick({ id: p.id, title: p.title })} />
                  <PtBtn variant="ghost" icon="✎" label="수정" to={`/admin/polls/${p.id}/edit`} />
                  <PtBtn
                    variant="delete"
                    icon="🗑"
                    label="삭제"
                    title="투표 삭제"
                    disabled={deleting}
                    onClick={() => setDeleteTarget(p)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="투표를 삭제할까요?"
          message={`${deleteTarget.status === 'active' ? '진행 중인 투표입니다. ' : ''}「${deleteTarget.title}」과 후보 ${deleteTarget.candidates}명, 표 ${deleteTarget.ballots.toLocaleString()}건이 모두 삭제됩니다. 이 작업은 되돌릴 수 없어요.`}
          confirmLabel="예, 삭제"
          cancelLabel="아니오"
          danger
          onConfirm={() => void doDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {resultsPick && (
        <ResultsModeDialog
          pollId={resultsPick.id}
          pollTitle={resultsPick.title}
          onClose={() => setResultsPick(null)}
        />
      )}

      {qrPoll && (
        <QrCodeModal pollId={qrPoll.id} title={qrPoll.title} onClose={() => setQrPoll(null)} />
      )}

      {creating && (
        <CreatePollModal
          onClose={() => setCreating(false)}
          onCreate={async (draft) => {
            const created = await createPoll(token, {
              title: draft.title,
              category: draft.category,
              description: draft.desc || undefined,
              closes_at: draft.closes_at ? `${draft.closes_at}T18:00:00` : undefined,
              max_selections: draft.max_selections,
              poll_type: draft.poll_type,
              verify_fields:
                draft.poll_type === 'restricted' && draft.verify_method === 'pin'
                  ? draft.verify_fields
                  : undefined,
              kind: draft.kind,
              identity_mode: draft.identity_mode,
              verify_method: draft.verify_method,
              candidates: draft.candidates,
            });
            setCreating(false);
            navigate(`/admin/polls/${created.id}/edit`);
          }}
        />
      )}
    </div>
  );
}
