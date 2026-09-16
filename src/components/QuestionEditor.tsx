import { useState } from 'react';
import {
  addQuestion,
  addQuestionOption,
  deleteQuestion,
  deleteQuestionOption,
  updateQuestion,
  updateQuestionOption,
} from '../api/admin';
import type { Poll, Question, QuestionType } from '../types/api';
import { ApiError } from '../api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TYPE_LABEL: Record<QuestionType, string> = {
  short_text: '주관식 (한 줄)',
  long_text: '주관식 (단락)',
  single_choice: '객관식 (하나)',
  multi_choice: '객관식 (여러 개)',
  scale: '척도 (점수)',
};

interface QuestionEditorProps {
  poll: Poll;
  token: string;
  onChange: () => Promise<void>;
  onMessage: (msg: string) => void;
}

export function QuestionEditor({ poll, token, onChange, onMessage }: QuestionEditorProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<QuestionType>('short_text');
  const [required, setRequired] = useState(true);
  const [options, setOptions] = useState(['', '']);
  const [busy, setBusy] = useState(false);
  const choice = type === 'single_choice' || type === 'multi_choice';
  const questions = poll.questions ?? [];

  const add = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await addQuestion(token, poll.id, {
        title: title.trim(),
        type,
        required,
        options: choice
          ? options
              .map((o) => o.trim())
              .filter(Boolean)
              .map((label) => ({ label }))
          : [],
      });
      setTitle('');
      setOptions(['', '']);
      onMessage('문항이 추가되었습니다.');
      await onChange();
    } catch (e) {
      onMessage(e instanceof ApiError ? e.message : '문항 추가에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const toggleRequired = async (q: Question) => {
    await updateQuestion(token, poll.id, q.id, { required: !q.required });
    await onChange();
  };

  const remove = async (q: Question) => {
    if (!window.confirm(`「${q.title}」 문항을 삭제할까요?`)) return;
    await deleteQuestion(token, poll.id, q.id);
    await onChange();
  };

  const addOpt = async (q: Question) => {
    const label = window.prompt('보기 문구');
    if (!label?.trim()) return;
    await addQuestionOption(token, poll.id, q.id, label.trim());
    await onChange();
  };

  const renameOpt = async (q: Question, optionId: number, current: string) => {
    const label = window.prompt('보기 문구', current);
    if (!label?.trim() || label.trim() === current) return;
    await updateQuestionOption(token, poll.id, q.id, optionId, { label: label.trim() });
    await onChange();
  };

  const removeOpt = async (q: Question, optionId: number) => {
    await deleteQuestionOption(token, poll.id, q.id, optionId);
    await onChange();
  };

  return (
    <div className="qe">
      <div className="qe-summary">
        <span className="qe-summary-count">{questions.length}개 문항</span>
        <span className="qe-summary-hint">시작 전에 문항을 1개 이상 넣어 주세요.</span>
      </div>

      {questions.length === 0 ? (
        <div className="qe-empty">아직 문항이 없습니다. 아래에서 첫 문항을 추가하세요.</div>
      ) : (
        <div className="qe-list">
          {questions.map((q, i) => (
            <article className="qe-card" key={q.id}>
              <div className="qe-card-top">
                <span className="qe-num">{i + 1}</span>
                <div className="qe-card-copy">
                  <div className="qe-title">{q.title}</div>
                  <div className="qe-meta">
                    <span className="qe-pill">{TYPE_LABEL[q.type]}</span>
                    <span className={`qe-pill${q.required ? ' is-req' : ''}`}>
                      {q.required ? '필수' : '선택'}
                    </span>
                  </div>
                </div>
                <div className="qe-card-actions">
                  <Button type="button" variant="outline" size="sm" onClick={() => void toggleRequired(q)}>
                    {q.required ? '선택으로' : '필수로'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => void remove(q)}>
                    삭제
                  </Button>
                </div>
              </div>

              {choiceType(q.type) && (
                <ul className="qe-options">
                  {q.options.map((o) => (
                    <li key={o.id} className="qe-option">
                      <button
                        type="button"
                        className="qe-option-label"
                        onClick={() => void renameOpt(q, o.id, o.label)}
                      >
                        {o.label}
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="보기 삭제"
                        onClick={() => void removeOpt(q, o.id)}
                      >
                        ✕
                      </Button>
                    </li>
                  ))}
                  <li>
                    <Button type="button" variant="outline" size="sm" onClick={() => void addOpt(q)}>
                      ＋ 보기 추가
                    </Button>
                  </li>
                </ul>
              )}

              {q.type === 'scale' && (
                <p className="qe-scale">
                  척도 범위: {q.scale_min} ~ {q.scale_max}점
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="qe-composer">
        <div className="qe-composer-head">
          <h3 className="qe-composer-title">문항 추가</h3>
          <p className="qe-composer-desc">질문 유형을 고른 뒤 문구를 입력하세요.</p>
        </div>

        <div className="qe-composer-grid">
          <div className="qe-field qe-field--grow">
            <Label htmlFor="qe-title">질문</Label>
            <Input
              id="qe-title"
              placeholder="예: 이번 프로젝트에서 가장 어려웠던 점은?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="qe-field">
            <Label htmlFor="qe-type">유형</Label>
            <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
              <SelectTrigger id="qe-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABEL) as QuestionType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="qe-required">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            <span>필수 응답</span>
          </label>
        </div>

        {choice && (
          <div className="qe-draft-opts">
            <Label>보기</Label>
            <div className="qe-draft-list">
              {options.map((o, i) => (
                <Input
                  key={i}
                  placeholder={`보기 ${i + 1}`}
                  value={o}
                  onChange={(e) =>
                    setOptions((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                  }
                />
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setOptions((p) => [...p, ''])}>
              ＋ 보기
            </Button>
          </div>
        )}

        <div className="qe-composer-foot">
          <Button type="button" onClick={() => void add()} disabled={busy || !title.trim()}>
            {busy ? '추가 중…' : '문항 추가'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function choiceType(type: QuestionType) {
  return type === 'single_choice' || type === 'multi_choice';
}
