import { useEffect, useState } from 'react';
import type { PollKind, PollType, VerifyField, VerifyMethod } from '../types/api';
import { hasSelectionMismatch, selectionMismatchMessage } from '../lib/pollWarnings';
import { AdminWarnBanner } from './AdminWarnBanner';
import { CloseButton } from './CloseButton';
import { ModalPortal } from './ModalPortal';
import { VerifyFieldPicker } from './VerifyFieldPicker';
import { Button } from '@/components/ui/button';
import { FormField, FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const CATEGORIES = ['브랜딩', '행사', '복지', '시상', '공간', '기타'];

interface CandDraft {
  name: string;
  team: string;
}

interface CreatePollModalProps {
  onClose: () => void;
  onCreate: (draft: {
    title: string;
    category: string;
    desc: string;
    closes_at: string;
    max_selections: number;
    poll_type: PollType;
    verify_fields: VerifyField[];
    kind: PollKind;
    identity_mode: 'identified' | 'secret';
    verify_method: VerifyMethod;
    candidates: { name: string; team?: string }[];
  }) => void;
}

export function CreatePollModal({ onClose, onCreate }: CreatePollModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('브랜딩');
  const [desc, setDesc] = useState('');
  const [closes, setCloses] = useState('');
  const [maxSelections, setMaxSelections] = useState(3);
  const [pollType, setPollType] = useState<PollType>('open');
  const [kind, setKind] = useState<PollKind>('vote');
  const [identityMode, setIdentityMode] = useState<'identified' | 'secret'>('identified');
  const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>('pin');
  const [verifyFields, setVerifyFields] = useState<VerifyField[]>(['email']);
  const [cands, setCands] = useState<CandDraft[]>([
    { name: '', team: '' },
    { name: '', team: '' },
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const setCand = (i: number, k: keyof CandDraft, v: string) =>
    setCands((prev) => prev.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  const addCand = () => setCands((prev) => [...prev, { name: '', team: '' }]);
  const removeCand = (i: number) => setCands((prev) => prev.filter((_, j) => j !== i));

  const filled = cands.filter((c) => c.name.trim());
  const valid = Boolean(title.trim() && (kind === 'form' || filled.length >= 2));
  const selectionWarn =
    kind !== 'form' && filled.length > 0 && hasSelectionMismatch(filled.length, maxSelections);

  const submit = () => {
    if (!valid) return;
    onCreate({
      title: title.trim(),
      category,
      desc: desc.trim(),
      closes_at: closes,
      max_selections: maxSelections,
      poll_type: pollType,
      verify_fields: verifyFields,
      kind,
      identity_mode:
        kind === 'form' || pollType === 'open'
          ? kind === 'form'
            ? 'identified'
            : 'secret'
          : identityMode,
      verify_method: pollType === 'restricted' ? verifyMethod : 'pin',
      candidates:
        kind === 'form'
          ? []
          : filled.map((c) => ({ name: c.name.trim(), team: c.team.trim() || undefined })),
    });
  };

  return (
    <ModalPortal>
      <div className="cp-backdrop">
        <div className="cp-modal cp-modal--settings">
          <div className="cp-head">
            <div>
              <span className="eyebrow">MotrexEV Vote</span>
              <h2>새로 만들기</h2>
            </div>
            <CloseButton variant="surface" onClick={onClose} />
          </div>

          <div className="cp-body cp-body--settings">
            <FormSection
              title="무엇을 만들까요?"
              description="처음부터 투표인지 폼인지 고릅니다. 나중에 바꿀 수 없습니다."
            >
              <div className="cp-kind-grid" role="radiogroup" aria-label="만들기 종류">
                <button
                  type="button"
                  role="radio"
                  aria-checked={kind === 'vote'}
                  className={`cp-kind-card${kind === 'vote' ? ' is-on' : ''}`}
                  onClick={() => setKind('vote')}
                >
                  <strong>순위 투표</strong>
                  <span>후보를 순위대로 고르는 투표입니다.</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={kind === 'form'}
                  className={`cp-kind-card${kind === 'form' ? ' is-on' : ''}`}
                  onClick={() => setKind('form')}
                >
                  <strong>인터뷰 폼</strong>
                  <span>주관식·객관식 문항으로 답을 받습니다.</span>
                </button>
              </div>
            </FormSection>

            <Separator className="my-8" />

            <FormSection
              title="기본 설정"
              description={kind === 'form' ? '폼 제목과 분류를 정합니다.' : '투표 제목과 분류를 정합니다.'}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                <FormField label="분류" className="col-span-full">
                  <div className="cp-chip-row" role="group" aria-label="분류">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`cp-chip${category === c ? ' is-on' : ''}`}
                        onClick={() => setCategory(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField
                  label={kind === 'form' ? '폼 제목' : '투표 제목'}
                  className="col-span-full"
                >
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      kind === 'form' ? '예: 2026 프로젝트 인터뷰' : '예: 2026 사내 동아리 이름 공모'
                    }
                    autoFocus
                  />
                </FormField>
                <FormField label="마감일" className="col-span-full sm:col-span-3">
                  <Input type="date" value={closes} onChange={(e) => setCloses(e.target.value)} />
                </FormField>
                <FormField
                  label="안내 문구"
                  className="col-span-full"
                  hint="선택 사항입니다. QR로 들어올 때 로그인 전에 보입니다."
                >
                  <Textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={
                      kind === 'form'
                        ? '응답자에게 보여줄 안내를 적어주세요.'
                        : '투표자에게 보여줄 안내를 적어주세요.'
                    }
                    rows={2}
                  />
                </FormField>
              </div>
            </FormSection>

            <Separator className="my-8" />

            <FormSection
              title="참여 방식"
              description="공개 범위와 본인 확인 방법을 설정합니다."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                <FormField label={kind === 'form' ? '참여 타입' : '투표 타입'} className="col-span-full">
                  <div className="cp-kind-grid cp-kind-grid--compact" role="radiogroup" aria-label="참여 타입">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={pollType === 'open'}
                      className={`cp-kind-card${pollType === 'open' ? ' is-on' : ''}`}
                      onClick={() => setPollType('open')}
                    >
                      <strong>불특정</strong>
                      <span>누구나 QR로 {kind === 'form' ? '제출' : '투표'}할 수 있습니다.</span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={pollType === 'restricted'}
                      className={`cp-kind-card${pollType === 'restricted' ? ' is-on' : ''}`}
                      onClick={() => setPollType('restricted')}
                    >
                      <strong>특정</strong>
                      <span>등록된 대상자만 {kind === 'form' ? '제출' : '투표'}할 수 있습니다.</span>
                    </button>
                  </div>
                </FormField>

                {pollType === 'restricted' && (
                  <>
                    <FormField label="확인 방법" className="col-span-full sm:col-span-3">
                      <Select
                        value={verifyMethod}
                        onValueChange={(v) => setVerifyMethod(v as VerifyMethod)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pin">비밀번호(PIN)</SelectItem>
                          <SelectItem value="sso">회사 계정(SSO)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    {kind === 'vote' && (
                      <FormField label="기명 / 무기명" className="col-span-full sm:col-span-3">
                        <Select
                          value={identityMode}
                          onValueChange={(v) =>
                            setIdentityMode(v as 'identified' | 'secret')
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="identified">
                              기명 — 누가 뽑았는지 관리자가 볼 수 있음
                            </SelectItem>
                            <SelectItem value="secret">
                              무기명 — 자격만 확인하고 선택과 연결하지 않음
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    )}
                    {verifyMethod === 'pin' && (
                      <div className="col-span-full space-y-2">
                        <VerifyFieldPicker value={verifyFields} onChange={setVerifyFields} />
                        <p className="text-xs text-muted-foreground">
                          생성 후 수정 화면에서 인증 항목 기준으로 대상자를 등록하세요.
                        </p>
                      </div>
                    )}
                    {verifyMethod === 'sso' && (
                      <p className="col-span-full text-sm text-muted-foreground">
                        회사 계정으로 자격을 확인합니다. 대상자를 미리 등록하지 않습니다.
                      </p>
                    )}
                  </>
                )}

                {kind === 'form' && (
                  <p className="col-span-full text-sm text-muted-foreground">
                    인터뷰 폼은 기명입니다. 누가 답했는지를 남깁니다.
                  </p>
                )}

                {kind !== 'form' && (
                  <FormField label="선택 가능 인원" className="col-span-full sm:col-span-3">
                    <Select
                      value={String(maxSelections)}
                      onValueChange={(v) => setMaxSelections(Number(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}명까지 선택 (순위 {n === 1 ? '1' : `1~${n}`})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
                {selectionWarn && (
                  <div className="col-span-full">
                    <AdminWarnBanner message={selectionMismatchMessage(filled.length, maxSelections)} />
                  </div>
                )}
              </div>
            </FormSection>

            {kind !== 'form' && (
              <>
                <Separator className="my-8" />
                <FormSection
                  title="후보"
                  description="최소 2명. 사진·Figma는 생성 후 수정 화면에서 등록할 수 있습니다."
                >
                  <div className="space-y-3">
                    {cands.map((c, i) => (
                      <div className="cp-cand-row" key={i}>
                        <span className="cp-cnum">{i + 1}</span>
                        <Input
                          value={c.name}
                          onChange={(e) => setCand(i, 'name', e.target.value)}
                          placeholder="후보 이름"
                        />
                        <Input
                          value={c.team}
                          onChange={(e) => setCand(i, 'team', e.target.value)}
                          placeholder="팀·제출자 (선택)"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCand(i)}
                          disabled={cands.length <= 2}
                          aria-label="삭제"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addCand}>
                      ＋ 후보 추가
                    </Button>
                  </div>
                </FormSection>
              </>
            )}

            <div className="cp-note mt-6">
              <span aria-hidden>ℹ️</span> 만들면 <b>준비중</b> 상태로 생성돼요. 목록에서 <b>시작</b>을
              누르면 QR 링크로 열립니다.
            </div>
          </div>

          <div className="cp-foot">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="button" disabled={!valid} onClick={submit}>
              {kind === 'form'
                ? '폼 만들고 문항 편집'
                : `투표 만들기${filled.length ? ` · 후보 ${filled.length}명` : ''}`}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
