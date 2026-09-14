import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { checkVote, getPoll, submitFormResponse } from '../api/polls';
import { CountdownPill } from '../components/CountdownPill';
import { VoteVerifyGate } from '../components/VoteVerifyGate';
import { getFingerprint } from '../lib/fingerprint';
import { pollIntroText } from '../lib/pollIntro';
import { getVoterName, getVoterToken, setVoterSession } from '../lib/voterToken';
import { parseVerifyFields } from '../lib/verifyFields';
import type { AnswerSubmit, Poll, Question } from '../types/api';
import { ApiError } from '../api/client';

function emptyAnswers(questions: Question[]): Record<number, AnswerSubmit> {
  const next: Record<number, AnswerSubmit> = {};
  for (const q of questions) {
    next[q.id] = { question_id: q.id, text_value: '', scale_value: null, option_ids: [] };
  }
  return next;
}

export function FormPage() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const id = Number(pollId);
  const fpRef = useRef('');
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<number, AnswerSubmit>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voterToken, setVoterToken] = useState<string | null>(null);
  const [voterName, setVoterName] = useState('');
  const [verified, setVerified] = useState(false);

  const isRestricted = (poll?.poll_type ?? 'open') === 'restricted';
  const needGate = isRestricted && !verified;
  const editable = isRestricted && poll?.status === 'active' && submitted;

  const applyCheck = useCallback((check: Awaited<ReturnType<typeof checkVote>>, questions: Question[]) => {
    const base = emptyAnswers(questions);
    if (check.voted && check.answers) {
      setSubmitted(true);
      for (const ans of check.answers) base[ans.question_id] = ans;
    } else {
      setSubmitted(false);
    }
    setAnswers(base);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fp = await getFingerprint();
        fpRef.current = fp;
        const pollData = await getPoll(id);
        if (cancelled) return;
        setPoll(pollData);
        const token = pollData.poll_type === 'restricted' ? getVoterToken(id) : null;
        if (pollData.poll_type === 'restricted' && token) {
          setVoterToken(token);
          setVoterName(getVoterName(id) || '');
          setVerified(true);
        }
        if (pollData.poll_type !== 'restricted' || token) {
          const check = await checkVote(id, fp, token);
          if (!cancelled) applyCheck(check, pollData.questions ?? []);
        } else {
          setAnswers(emptyAnswers(pollData.questions ?? []));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : '폼을 불러올 수 없습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, applyCheck]);

  const onVerified = async (token: string, name: string) => {
    setVoterSession(id, token, name);
    setVoterToken(token);
    setVoterName(name);
    setVerified(true);
    if (!poll) return;
    const check = await checkVote(id, fpRef.current, token);
    applyCheck(check, poll.questions ?? []);
  };

  const patch = (qid: number, partial: Partial<AnswerSubmit>) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: { ...prev[qid], ...partial, question_id: qid },
    }));
  };

  const submit = async () => {
    if (!poll) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = (poll.questions ?? []).map((q) => answers[q.id] ?? { question_id: q.id, option_ids: [] });
      await submitFormResponse(id, fpRef.current, payload, voterToken);
      sessionStorage.setItem(`form_complete_${id}`, JSON.stringify({ answers: payload, questions: poll.questions }));
      navigate(`/polls/${id}/complete`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="vote-page"><p>불러오는 중…</p></div>;
  if (error && !poll) return <div className="vote-page"><p className="login-error">{error}</p></div>;
  if (!poll) return null;
  if (poll.status === 'closed') {
    return (
      <div className="vote-page">
        <p>이 폼은 종료되었습니다.</p>
        <Link to={`/polls/${id}/results`}>결과 보기</Link>
      </div>
    );
  }
  if (needGate) {
    return (
      <div className="vote-page">
        <VoteVerifyGate
          pollId={id}
          verifyFields={parseVerifyFields(poll.verify_fields)}
          onVerified={(token, name) => void onVerified(token, name)}
        />
      </div>
    );
  }

  const locked = submitted && !editable;

  return (
    <div className="vote-page form-page">
      <header className="vote-head">
        <Link to="/" className="vote-back">← 목록</Link>
        <div>
          <span className="eyebrow">Interview form</span>
          <h1>{poll.title}</h1>
          {pollIntroText(poll) && <p className="vote-intro">{pollIntroText(poll)}</p>}
          {voterName && <p className="vote-voter">{voterName}님으로 제출합니다.</p>}
        </div>
        {poll.closes_at && <CountdownPill closesAt={poll.closes_at} />}
      </header>

      <div className="form-questions">
        {(poll.questions ?? []).map((q, i) => {
          const ans = answers[q.id] ?? { question_id: q.id, option_ids: [] };
          return (
            <section className="form-q" key={q.id}>
              <h2>
                <span className="edit-cnum">{i + 1}</span>
                {q.title}
                {q.required ? <i>*</i> : <em>선택</em>}
              </h2>
              {q.help_text && <p className="cp-hint">{q.help_text}</p>}
              {q.type === 'short_text' && (
                <input
                  className="cp-input"
                  disabled={locked}
                  value={ans.text_value ?? ''}
                  onChange={(e) => patch(q.id, { text_value: e.target.value })}
                />
              )}
              {q.type === 'long_text' && (
                <textarea
                  className="cp-input cp-area"
                  rows={5}
                  disabled={locked}
                  value={ans.text_value ?? ''}
                  onChange={(e) => patch(q.id, { text_value: e.target.value })}
                />
              )}
              {q.type === 'scale' && (
                <div className="form-scale">
                  {Array.from({ length: q.scale_max - q.scale_min + 1 }, (_, n) => q.scale_min + n).map((n) => (
                    <label key={n}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        disabled={locked}
                        checked={ans.scale_value === n}
                        onChange={() => patch(q.id, { scale_value: n })}
                      />
                      {n}
                    </label>
                  ))}
                </div>
              )}
              {q.type === 'single_choice' && (
                <div className="form-choices">
                  {q.options.map((o) => (
                    <label key={o.id}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        disabled={locked}
                        checked={(ans.option_ids ?? [])[0] === o.id}
                        onChange={() => patch(q.id, { option_ids: [o.id] })}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              )}
              {q.type === 'multi_choice' && (
                <div className="form-choices">
                  {q.options.map((o) => {
                    const selected = (ans.option_ids ?? []).includes(o.id);
                    return (
                      <label key={o.id}>
                        <input
                          type="checkbox"
                          disabled={locked}
                          checked={selected}
                          onChange={() => {
                            const cur = ans.option_ids ?? [];
                            patch(q.id, {
                              option_ids: selected ? cur.filter((x) => x !== o.id) : [...cur, o.id],
                            });
                          }}
                        />
                        {o.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {error && <p className="login-error">{error}</p>}
      <button
        type="button"
        className="btn btn-primary"
        disabled={submitting || locked || poll.status !== 'active'}
        onClick={() => void submit()}
      >
        {submitting ? '제출 중…' : submitted ? '다시 제출' : '제출하기'}
      </button>
    </div>
  );
}
