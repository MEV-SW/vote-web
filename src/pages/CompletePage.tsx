import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { checkVote, getPoll } from '../api/polls';
import { Placeholder } from '../components/Placeholder';
import { getFingerprint } from '../lib/fingerprint';
import { getVoterToken } from '../lib/voterToken';
import type { AnswerSubmit, Candidate, Question } from '../types/api';

export function CompletePage() {
  const { pollId } = useParams();
  const id = Number(pollId);
  const [chosen, setChosen] = useState<Candidate[]>([]);
  const [formSummary, setFormSummary] = useState<{ questions: Question[]; answers: AnswerSubmit[] } | null>(null);
  const [fingerprint, setFingerprint] = useState('');
  const [loading, setLoading] = useState(true);
  const [isForm, setIsForm] = useState(false);

  useEffect(() => {
    (async () => {
      const fp = await getFingerprint();
      setFingerprint(fp);
      const formStored = sessionStorage.getItem(`form_complete_${id}`);
      if (formStored) {
        try {
          setFormSummary(JSON.parse(formStored));
          setIsForm(true);
        } catch { /* ignore */ }
      }
      const stored = sessionStorage.getItem(`vote_complete_${id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed[0]?.name) setChosen(parsed as Candidate[]);
        } catch { /* ignore */ }
      }
      try {
        const poll = await getPoll(id);
        setIsForm((poll.kind ?? 'vote') === 'form');
        if (!stored && poll.kind !== 'form') {
          const check = await checkVote(id, fp, getVoterToken(id));
          if (check.votes) {
            const ids = [...check.votes].sort((a, b) => a.rank - b.rank).map((v) => v.candidate_id);
            setChosen(ids.map((cid) => poll.candidates.find((c) => c.id === cid)).filter(Boolean) as Candidate[]);
          }
        }
      } catch { /* poll meta optional */ } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const now = new Date();
  const stamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (loading) return <div className="done-page">불러오는 중…</div>;

  return (
    <div className="done-page">
      <div className="done-card">
        <div className="done-confetti">
          {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties} />)}
        </div>
        <div className="done-check">✓</div>
        <span className="eyebrow">{isForm ? 'Response submitted' : 'Vote submitted'}</span>
        <h1 className="done-title">{isForm ? '응답이 접수되었어요!' : '투표가 접수되었어요!'}</h1>
        <p className="done-sub">{isForm ? '참여해 주셔서 감사합니다. 아래는 제출한 요약입니다.' : '소중한 한 표 고마워요. 아래는 내가 고른 순위예요.'}</p>

        {isForm && formSummary ? (
          <ul className="form-result-texts">
            {formSummary.questions.map((q) => {
              const ans = formSummary.answers.find((a) => a.question_id === q.id);
              const labels = q.options.filter((o) => (ans?.option_ids ?? []).includes(o.id)).map((o) => o.label);
              const value = ans?.text_value || (ans?.scale_value != null ? `${ans.scale_value}점` : labels.join(', ')) || '—';
              return <li key={q.id}><strong>{q.title}</strong> · {value}</li>;
            })}
          </ul>
        ) : chosen.length > 0 ? (
          <div className={`done-picks done-picks--${Math.min(chosen.length, 5)}`}>
            {chosen.map((c, i) => {
              const rank = i + 1;
              return (
                <article className="done-pick" key={c.id} data-rank={rank} style={{ '--ph-h': c.tint } as React.CSSProperties}>
                  <div className="done-pick-media">
                    <Placeholder cand={c} ratio="1 / 1" round="0" />
                    <span className="done-pick-rank" aria-label={`${rank}순위`}>{rank}</span>
                  </div>
                  <div className="done-pick-meta">
                    <h2 className="done-pick-name">{c.name}</h2>
                    {c.team && <p className="done-pick-team">{c.team}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="done-empty">선택 내역이 없습니다.</p>
        )}

        <div className="done-receipt">
          <div><span>접수 시각</span><b>{stamp}</b></div>
          <div><span>ID</span><b>#{id}-{fingerprint.slice(0, 8)}</b></div>
          <div><span>상태</span><b style={{ color: 'oklch(0.5 0.13 150)' }}>● 집계 대기</b></div>
        </div>

        <nav className="done-actions" aria-label="다음 단계">
          <Link to={`/polls/${id}`} className="done-action done-action--back">
            <span className="done-action-arrow" aria-hidden>←</span>
            <span className="done-action-label">{isForm ? '폼 다시 보기' : '투표 화면 다시 보기'}</span>
          </Link>
          <Link to={`/polls/${id}/results`} className="done-action done-action--forward done-action--emph">
            <span className="done-action-label">결과 보기</span>
            <span className="done-action-arrow" aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
