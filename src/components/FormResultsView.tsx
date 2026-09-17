import { useMemo, useState } from 'react';
import type { FormQuestionSummary, FormResponseOut, FormResultsOut, QuestionType } from '../types/api';

const TYPE_LABEL: Record<string, string> = {
  short_text: '주관식',
  long_text: '주관식',
  single_choice: '객관식',
  multi_choice: '복수 선택',
  scale: '척도',
};

const TEXT_PREVIEW = 5;

function isTextType(type: QuestionType) {
  return type === 'short_text' || type === 'long_text';
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function respondentLabel(r: { name?: string | null; email?: string | null }) {
  const name = r.name?.trim();
  const email = r.email?.trim();
  if (name && email) return `${name} · ${email}`;
  return name || email || '익명';
}

type TextEntry = {
  ballotId: number;
  text: string;
  name?: string | null;
  email?: string | null;
  submittedAt: string;
};

function textEntriesForQuestion(questionId: number, responses: FormResponseOut[]): TextEntry[] {
  const out: TextEntry[] = [];
  for (const r of responses) {
    const ans = r.answers.find((a) => a.question_id === questionId);
    const text = ans?.text_value?.trim();
    if (!text) continue;
    out.push({
      ballotId: r.ballot_id,
      text,
      name: r.voter_name,
      email: r.voter_email,
      submittedAt: r.submitted_at,
    });
  }
  return out;
}

function TextAnswerList({ entries }: { entries: TextEntry[] }) {
  const [showAll, setShowAll] = useState(false);
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set());
  const visible = showAll ? entries : entries.slice(0, TEXT_PREVIEW);
  const hidden = Math.max(0, entries.length - TEXT_PREVIEW);

  const toggleOpen = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (entries.length === 0) {
    return <p className="form-result-empty">아직 주관식 응답이 없습니다.</p>;
  }

  return (
    <div className="form-result-text-list">
      <ol className="form-result-text-ol">
        {visible.map((e, i) => {
          const long = e.text.length > 160 || e.text.includes('\n');
          const open = openIds.has(e.ballotId) || !long;
          return (
            <li key={`${e.ballotId}-${i}`} className="form-result-text-item">
              <div className="form-result-text-meta">
                <span className="form-result-text-who">{respondentLabel(e)}</span>
                <time dateTime={e.submittedAt}>{formatWhen(e.submittedAt)}</time>
              </div>
              <p className={`form-result-text-body${open ? ' is-open' : ''}`}>{e.text}</p>
              {long && (
                <button type="button" className="form-result-text-more" onClick={() => toggleOpen(e.ballotId)}>
                  {open ? '접기' : '전체 보기'}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {hidden > 0 && (
        <button type="button" className="form-result-expand" onClick={() => setShowAll((v) => !v)}>
          {showAll ? '간단히 보기' : `나머지 ${hidden}건 더 보기`}
        </button>
      )}
    </div>
  );
}

function ChoiceBars({ q }: { q: FormQuestionSummary }) {
  if (q.option_counts.length === 0) return null;
  return (
    <ul className="form-result-bars">
      {q.option_counts.map((o) => {
        const pct = q.response_count ? Math.round((o.count / q.response_count) * 100) : 0;
        return (
          <li key={o.option_id}>
            <div className="form-result-bar-label">
              <span>{o.label}</span>
              <b>
                {o.count}
                <em>{pct}%</em>
              </b>
            </div>
            <div className="pt-bar">
              <i style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ScaleBars({ q }: { q: FormQuestionSummary }) {
  const entries = Object.entries(q.scale_counts)
    .map(([k, v]) => ({ score: Number(k), count: v }))
    .sort((a, b) => a.score - b.score);
  if (entries.length === 0 && q.scale_avg == null) return null;
  const max = Math.max(1, ...entries.map((e) => e.count));
  return (
    <div className="form-result-scale">
      {q.scale_avg != null && <p className="form-result-avg">평균 {q.scale_avg}점</p>}
      {entries.length > 0 && (
        <ul className="form-result-bars form-result-bars--scale">
          {entries.map((e) => (
            <li key={e.score}>
              <div className="form-result-bar-label">
                <span>{e.score}점</span>
                <b>{e.count}</b>
              </div>
              <div className="pt-bar">
                <i style={{ width: `${Math.round((e.count / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuestionBlock({
  q,
  responses,
  showTexts,
}: {
  q: FormQuestionSummary;
  responses: FormResponseOut[];
  showTexts: boolean;
}) {
  const texts = useMemo(
    () => (showTexts && isTextType(q.type) ? textEntriesForQuestion(q.question_id, responses) : []),
    [q.question_id, q.type, responses, showTexts],
  );

  return (
    <article className="form-result-q">
      <header>
        <div>
          <p className="form-result-q-type">{TYPE_LABEL[q.type] ?? q.type}</p>
          <h3>{q.title}</h3>
        </div>
        <span className="form-result-q-count">{q.response_count}명</span>
      </header>
      <ChoiceBars q={q} />
      <ScaleBars q={q} />
      {showTexts && isTextType(q.type) && <TextAnswerList entries={texts} />}
      {!showTexts && isTextType(q.type) && q.texts.length > 0 && (
        <p className="form-result-empty">주관식 응답 {q.texts.length}건 (개별 공개 없음)</p>
      )}
    </article>
  );
}

function PersonList({ responses }: { responses: FormResponseOut[] }) {
  const [openId, setOpenId] = useState<number | null>(responses[0]?.ballot_id ?? null);

  if (responses.length === 0) {
    return <p className="form-result-empty">개별 응답이 없습니다.</p>;
  }

  return (
    <div className="form-result-people">
      {responses.map((r) => {
        const open = openId === r.ballot_id;
        return (
          <article key={r.ballot_id} className={`form-result-person${open ? ' is-open' : ''}`}>
            <button
              type="button"
              className="form-result-person-head"
              onClick={() => setOpenId(open ? null : r.ballot_id)}
              aria-expanded={open}
            >
              <span>
                <strong>{respondentLabel({ name: r.voter_name, email: r.voter_email })}</strong>
                <time dateTime={r.submitted_at}>{formatWhen(r.submitted_at)}</time>
              </span>
              <span className="form-result-chevron" aria-hidden>
                {open ? '▴' : '▾'}
              </span>
            </button>
            {open && (
              <dl>
                {r.answers.map((a) => (
                  <div key={a.question_id}>
                    <dt>{a.title}</dt>
                    <dd>
                      {a.text_value
                        || (a.scale_value != null ? `${a.scale_value}점` : a.option_labels.join(', '))
                        || '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function FormResultsView({
  results,
  showIndividual,
}: {
  results: FormResultsOut;
  showIndividual: boolean;
}) {
  const [mode, setMode] = useState<'question' | 'person'>('question');

  return (
    <div className="form-results">
      <div className="manage-stats">
        <div className="mstat">
          <div className="mstat-v">{results.total_responses}</div>
          <div className="mstat-k">응답</div>
        </div>
        <div className="mstat">
          <div className="mstat-v">{Math.round(results.participation_rate * 100)}%</div>
          <div className="mstat-k">참여율</div>
        </div>
        <div className="mstat">
          <div className="mstat-v">{results.questions.length}</div>
          <div className="mstat-k">문항</div>
        </div>
      </div>

      {showIndividual && (
        <div className="form-result-tabs" role="tablist" aria-label="결과 보기">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'question'}
            className={mode === 'question' ? 'is-active' : undefined}
            onClick={() => setMode('question')}
          >
            문항별
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'person'}
            className={mode === 'person' ? 'is-active' : undefined}
            onClick={() => setMode('person')}
          >
            응답자별
          </button>
        </div>
      )}

      {(!showIndividual || mode === 'question') &&
        results.questions.map((q) => (
          <QuestionBlock
            key={q.question_id}
            q={q}
            responses={results.responses}
            showTexts={showIndividual}
          />
        ))}

      {showIndividual && mode === 'person' && <PersonList responses={results.responses} />}
    </div>
  );
}
