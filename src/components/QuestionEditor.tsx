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

  const add = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await addQuestion(token, poll.id, {
        title: title.trim(),
        type,
        required,
        options: choice ? options.map((o) => o.trim()).filter(Boolean).map((label) => ({ label })) : [],
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
    <section className="edit-card">
      <div className="edit-card-head">
        <h2 className="edit-card-title">문항</h2>
        <span className="edit-count">{poll.questions?.length ?? 0}개</span>
      </div>
      <p className="edit-art-hint">주관식·객관식·척도를 섞어 인터뷰 폼을 구성할 수 있어요. 시작 전에 문항을 1개 이상 넣어 주세요.</p>

      <div className="q-list">
        {(poll.questions ?? []).map((q, i) => (
          <article className="q-card" key={q.id}>
            <div className="q-card-top">
              <span className="edit-cnum">{i + 1}</span>
              <div>
                <div className="edit-cand-name">{q.title}</div>
                <div className="edit-cand-team">{TYPE_LABEL[q.type]} · {q.required ? '필수' : '선택'}</div>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => void toggleRequired(q)}>
                {q.required ? '필수로 유지' : '필수로 전환'}
              </button>
              <button type="button" className="edit-cand-del" onClick={() => void remove(q)}>삭제</button>
            </div>
            {choiceType(q.type) && (
              <ul className="q-options">
                {q.options.map((o) => (
                  <li key={o.id}>
                    <button type="button" className="q-opt-btn" onClick={() => void renameOpt(q, o.id, o.label)}>{o.label}</button>
                    <button type="button" className="cp-remove" onClick={() => void removeOpt(q, o.id)} aria-label="보기 삭제">✕</button>
                  </li>
                ))}
                <li>
                  <button type="button" className="cp-add" onClick={() => void addOpt(q)}>＋ 보기 추가</button>
                </li>
              </ul>
            )}
            {q.type === 'scale' && (
              <p className="cp-hint">{q.scale_min} ~ {q.scale_max}점</p>
            )}
          </article>
        ))}
      </div>

      <div className="edit-add-block">
        <span className="cp-label">문항 추가</span>
        <div className="edit-add-row" style={{ flexWrap: 'wrap' }}>
          <input className="cp-input" placeholder="질문" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="cp-input" value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
            {(Object.keys(TYPE_LABEL) as QuestionType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
          <label className="q-req">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> 필수
          </label>
        </div>
        {choice && (
          <div className="q-draft-opts">
            {options.map((o, i) => (
              <input
                key={i}
                className="cp-input"
                placeholder={`보기 ${i + 1}`}
                value={o}
                onChange={(e) => setOptions((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ))}
            <button type="button" className="cp-add" onClick={() => setOptions((p) => [...p, ''])}>＋ 보기</button>
          </div>
        )}
        <button type="button" className="btn btn-primary edit-add-btn" onClick={() => void add()} disabled={busy || !title.trim()}>
          문항 추가
        </button>
      </div>
    </section>
  );
}

function choiceType(type: QuestionType) {
  return type === 'single_choice' || type === 'multi_choice';
}
