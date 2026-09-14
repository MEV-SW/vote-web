import type { FormQuestionSummary, FormResultsOut } from '../types/api';

const TYPE_LABEL: Record<string, string> = {
  short_text: '주관식',
  long_text: '주관식',
  single_choice: '객관식',
  multi_choice: '복수 선택',
  scale: '척도',
};

function SummaryCard({ q, showTexts }: { q: FormQuestionSummary; showTexts: boolean }) {
  return (
    <article className="form-result-q">
      <header>
        <h3>{q.title}</h3>
        <span>{TYPE_LABEL[q.type] ?? q.type} · {q.response_count}명 응답</span>
      </header>
      {q.option_counts.length > 0 && (
        <ul className="form-result-bars">
          {q.option_counts.map((o) => {
            const pct = q.response_count ? Math.round((o.count / q.response_count) * 100) : 0;
            return (
              <li key={o.option_id}>
                <div className="form-result-bar-label">
                  <span>{o.label}</span>
                  <b>{o.count}</b>
                </div>
                <div className="pt-bar"><i style={{ width: `${pct}%` }} /></div>
              </li>
            );
          })}
        </ul>
      )}
      {q.scale_avg != null && (
        <p className="form-result-avg">평균 {q.scale_avg}점</p>
      )}
      {showTexts && q.texts.length > 0 && (
        <ul className="form-result-texts">
          {q.texts.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </article>
  );
}

export function FormResultsView({
  results,
  showIndividual,
}: {
  results: FormResultsOut;
  showIndividual: boolean;
}) {
  return (
    <div className="form-results">
      <div className="manage-stats">
        <div className="mstat"><div className="mstat-v">{results.total_responses}</div><div className="mstat-k">응답</div></div>
        <div className="mstat"><div className="mstat-v">{Math.round(results.participation_rate * 100)}%</div><div className="mstat-k">참여율</div></div>
        <div className="mstat"><div className="mstat-v">{results.questions.length}</div><div className="mstat-k">문항</div></div>
      </div>
      {results.questions.map((q) => (
        <SummaryCard key={q.question_id} q={q} showTexts={showIndividual} />
      ))}
      {showIndividual && results.responses.length > 0 && (
        <section className="form-result-individuals">
          <h2>개별 응답</h2>
          {results.responses.map((r) => (
            <article className="form-result-person" key={r.ballot_id}>
              <h3>{r.voter_name || '익명'} {r.voter_email ? `· ${r.voter_email}` : ''}</h3>
              <p className="cp-hint">{new Date(r.submitted_at).toLocaleString('ko-KR')}</p>
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
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
