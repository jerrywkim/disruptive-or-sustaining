import { useState, useEffect } from 'react';
import { CASES, PALETTE as P, verdictFor, type Case } from './data';

type Screen = 'landing' | 'grid' | 'diagnostic' | 'compare';
type AllAnswers = Record<string, (number | null)[]>;

function loadAnswers(): AllAnswers {
  try {
    const raw = localStorage.getItem('diagnostic:answers');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAnswers(all: AllAnswers) {
  localStorage.setItem('diagnostic:answers', JSON.stringify(all));
}

const CASE_PHOTOS: Record<string, string> = {
  uber: '/masthead-uber.png',
  tesla: '/masthead-tesla.png',
  iphone: '/masthead-iphone.png',
  llm: '/masthead-llm.png',
};

function CasePhoto({ caseId, height }: { caseId: string; height: number }) {
  return (
    <img
      src={CASE_PHOTOS[caseId]}
      alt=""
      style={{ width: '100%', height, objectFit: 'cover', display: 'block' }}
    />
  );
}

// ── Verdict bar ────────────────────────────────────────────────────────
function VerdictBar({ score, answered }: { score: number; answered: number }) {
  const pct = Math.max(2, Math.min(98, ((score + 10) / 20) * 100));
  const verdict = verdictFor(score);
  const dotSize = answered > 0 ? 22 : 14;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontFamily: '"IBM Plex Mono"', fontSize: 10.5, letterSpacing: 2, color: P.inkSoft }}>
        <span>SUSTAINING</span><span>AMBIGUOUS</span><span>DISRUPTIVE</span>
      </div>
      <div style={{ position: 'relative', height: 10, background: `linear-gradient(90deg, ${P.slate} 0%, ${P.slate} 20%, ${P.ambig} 50%, ${P.accent} 80%, ${P.accent} 100%)`, borderRadius: 1 }}>
        {[20, 40, 60, 80].map((p) => (
          <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -3, bottom: -3, width: 1, background: P.paper, opacity: 0.6 }} />
        ))}
        <div style={{
          position: 'absolute', left: `${pct}%`, top: '50%',
          transform: 'translate(-50%, -50%)',
          width: dotSize, height: dotSize,
          borderRadius: '50%', background: P.paper, border: `2.5px solid ${P.ink}`,
          boxShadow: '0 2px 6px rgba(0,0,0,.18)',
          transition: 'left .35s cubic-bezier(.2,.7,.3,1), width .2s, height .2s',
        }} />
      </div>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.inkSoft, marginBottom: 4 }}>CURRENT VERDICT</div>
          <div style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 26, fontWeight: 500, color: P.ink, letterSpacing: -0.4 }}>
            {answered === 0 ? 'Awaiting answers' : verdict.label}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.inkSoft, marginBottom: 4 }}>SCORE</div>
          <div style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 26, fontWeight: 500, color: P.ink, letterSpacing: -0.4 }}>
            {score > 0 ? `+${score}` : score}{' '}
            <span style={{ fontSize: 15, color: P.inkSoft }}>/ {answered}/5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Diagnostic page ─────────────────────────────────────────────────────
function DiagnosticPage({ kase, answers, onAnswer, onBack }: {
  kase: Case;
  answers: (number | null)[];
  onAnswer: (qi: number, oi: number) => void;
  onBack: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const score = answers.reduce((s: number, a, i) => s + (a == null ? 0 : kase.questions[i].options[a].score), 0);
  const answered = answers.filter(a => a != null).length;
  const caseNum = CASES.findIndex(c => c.id === kase.id) + 1;

  return (
    <div style={{ width: '100%', height: '100vh', background: P.paper, color: P.ink, fontFamily: '"IBM Plex Sans"', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top header */}
      <div style={{ borderBottom: `1px solid ${P.rule}`, padding: '12px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2.5, color: P.inkSoft, background: P.paper, flexShrink: 0 }}>
        <span>DISRUPTIVE&nbsp;·&nbsp;OR&nbsp;·&nbsp;SUSTAINING&nbsp;?</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 10, letterSpacing: 1.5 }}>Developed by Jerry Kim</span>
          <span>CASE {String(caseNum).padStart(2, '0')} / 04</span>
        </div>
      </div>

      {/* Masthead photo */}
      <div style={{ position: 'relative', width: '100%', height: 220, flexShrink: 0, borderBottom: `1.5px solid ${P.ink}` }}>
        <CasePhoto caseId={kase.id} height={220} />
        <div style={{ position: 'absolute', left: 56, bottom: 18, padding: '8px 14px', background: P.paper, fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.inkSoft }}>
          {kase.figCaption}
        </div>
        <button
          onClick={onBack}
          style={{ position: 'absolute', right: 56, bottom: 18, padding: '8px 14px', background: P.paper, border: `1px solid ${P.rule}`, fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.inkSoft, cursor: 'pointer' }}
        >
          ← ALL CASES
        </button>
      </div>

      {/* Scrolling body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 56px 200px' }}>
        <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, color: P.accent, marginBottom: 12 }}>
          CASE STUDY · {kase.era.toUpperCase()}
        </div>
        <h1 style={{ margin: '0 0 16px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 'clamp(32px, 4vw, 50px)', lineHeight: 1.04, fontWeight: 500, letterSpacing: -1.1, color: P.ink, maxWidth: 820 }}>
          Was {kase.shortTitle}, at the moment it entered, a{' '}
          <em style={{ fontStyle: 'italic', color: P.accent }}>disruptive</em> innovation — or a{' '}
          <em style={{ fontStyle: 'italic', color: P.slate }}>sustaining</em> one?
        </h1>
        <p style={{ margin: '0 0 6px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 16.5, lineHeight: 1.6, color: P.inkSoft, maxWidth: 720 }}>
          {kase.blurb}
        </p>
        <p style={{ margin: '0 0 24px', fontFamily: '"IBM Plex Sans"', fontSize: 12.5, color: P.accent, fontWeight: 500, letterSpacing: 0.3 }}>
          Answer based on the time of entry — not the present day.
        </p>

        <div style={{ borderTop: `1.5px solid ${P.ink}` }}>
          {kase.questions.map((q, qi) => (
            <div key={q.id} style={{ padding: '20px 0', borderTop: qi === 0 ? 'none' : `1px solid ${P.ruleSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                <span style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10.5, color: P.inkSoft, letterSpacing: 2 }}>0{qi + 1}</span>
                <h3 style={{ margin: 0, fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 19, fontWeight: 500, color: P.ink, letterSpacing: -0.2 }}>{q.title}</h3>
              </div>
              <p style={{ margin: '0 0 12px 22px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 14.5, lineHeight: 1.55, color: P.inkSoft, maxWidth: 620 }}>
                {q.prompt}
              </p>
              <div style={{ marginLeft: 22, display: 'flex', gap: 0, border: `1px solid ${P.rule}`, borderRadius: 2, overflow: 'hidden', background: P.card, width: 'fit-content', maxWidth: '100%', flexWrap: 'nowrap', overflowX: 'auto' }}>
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const tone = opt.score < 0 ? P.slate : opt.score > 0 ? P.accent : P.ambig;
                  return (
                    <button
                      key={oi}
                      onClick={() => onAnswer(qi, oi)}
                      style={{
                        border: 'none',
                        borderRight: oi === q.options.length - 1 ? 'none' : `1px solid ${P.rule}`,
                        background: selected ? tone : 'transparent',
                        color: selected ? P.paper : P.ink,
                        fontFamily: '"IBM Plex Sans"', fontSize: 12, fontWeight: selected ? 500 : 400,
                        padding: '9px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'background .12s, color .12s',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {answers[qi] != null && (
                <p style={{ margin: '8px 0 0 22px', fontFamily: '"Source Serif 4", Georgia, serif', fontStyle: 'italic', fontSize: 13, color: P.inkSoft }}>
                  → {q.options[answers[qi]!].blurb}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Instructor reveal */}
        <div style={{ marginTop: 32, padding: '20px 0', borderTop: `1.5px solid ${P.ink}`, borderBottom: `1px solid ${P.ruleSoft}` }}>
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              style={{ border: `1px solid ${P.ink}`, background: 'transparent', color: P.ink, fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, padding: '11px 16px', cursor: 'pointer' }}
            >
              ↳ REVEAL INSTRUCTOR INTERPRETATION
            </button>
          ) : (
            <div>
              <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, color: P.accent, marginBottom: 8 }}>INSTRUCTOR INTERPRETATION</div>
              <p
                style={{ margin: 0, fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 15.5, lineHeight: 1.6, color: P.ink, maxWidth: 640 }}
                dangerouslySetInnerHTML={{ __html: kase.instructorNote }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sticky verdict footer */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: P.paper, borderTop: `1.5px solid ${P.ink}`, padding: '20px 56px 22px', boxShadow: '0 -10px 24px -16px rgba(0,0,0,.15)', zIndex: 10 }}>
        <VerdictBar score={score} answered={answered} />
      </div>
    </div>
  );
}

// ── Landing page ────────────────────────────────────────────────────────
function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: P.paper, color: P.ink, fontFamily: '"IBM Plex Sans"' }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${P.rule}`, padding: '12px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2.5, color: P.inkSoft }}>
        <span>DISRUPTIVE&nbsp;·&nbsp;OR&nbsp;·&nbsp;SUSTAINING&nbsp;?</span>
        <span>Developed by Jerry Kim</span>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '64px 56px 80px' }}>
        <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, color: P.accent, marginBottom: 16 }}>
          INTERACTIVE DIAGNOSTIC · DISRUPTIVE INNOVATION
        </div>
        <h1 style={{ margin: '0 0 24px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.02, fontWeight: 500, letterSpacing: -1.5, color: P.ink, maxWidth: 820 }}>
          Is this innovation{' '}
          <em style={{ fontStyle: 'italic', color: P.accent }}>disruptive</em>{' '}
          — or{' '}
          <em style={{ fontStyle: 'italic', color: P.slate }}>sustaining</em>?
        </h1>
        <p style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 18, lineHeight: 1.65, color: P.inkSoft, maxWidth: 700, marginBottom: 48 }}>
          Not every successful technology is disruptive. Some innovations are sustaining: they make existing products better for mainstream customers. Others are disruptive: they begin in overlooked or low-end markets, look unattractive to incumbents' best customers, and improve over time until they challenge the mainstream.
        </p>
        <p style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 18, lineHeight: 1.65, color: P.inkSoft, maxWidth: 700, marginBottom: 48 }}>
          Your task is to evaluate each innovation at the time it entered the market. Use the diagnostic questions to decide whether the case tilts toward sustaining innovation, disruptive innovation, or something more ambiguous.
        </p>

        {/* Two-column comparison */}
        <div style={{ borderTop: `1.5px solid ${P.ink}`, marginBottom: 48 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ padding: '32px 32px 32px 0', borderRight: `1px solid ${P.ruleSoft}` }}>
              <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.slate, marginBottom: 12 }}>SUSTAINING INNOVATION</div>
              <p style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 15.5, lineHeight: 1.6, color: P.inkSoft, marginBottom: 16 }}>
                Improves performance for existing mainstream customers along dimensions they already value. Incumbents usually have strong incentives to respond.
              </p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: P.inkSoft }}>
                <li>Mainstream customers have higher WTP</li>
                <li>Incumbents' best customers welcome it</li>
                <li>Incumbents could make more money adopting it</li>
                <li>Improves existing performance dimensions</li>
                <li>Enters at the high end or mainstream market</li>
              </ul>
            </div>
            <div style={{ padding: '32px 0 32px 32px' }}>
              <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.accent, marginBottom: 12 }}>DISRUPTIVE INNOVATION</div>
              <p style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 15.5, lineHeight: 1.6, color: P.inkSoft, marginBottom: 16 }}>
                Initially appeals to overlooked, low-end, or non-consuming customers. May be worse on traditional metrics but better on simplicity, price, or accessibility.
              </p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: P.inkSoft }}>
                <li>Mainstream customers initially have lower WTP</li>
                <li>Incumbents' best customers are indifferent</li>
                <li>Incumbents have weak incentives to adopt</li>
                <li>Begins in a low-end or new-market foothold</li>
                <li>Initially worse on mainstream metrics, improves over time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Diagram */}
        <div style={{ marginBottom: 48 }}>
          <img
            src="/disruptive-graph.jpg"
            alt="Performance trajectory chart showing sustaining and disruptive technology curves over time"
            style={{ width: '100%', display: 'block', border: `1px solid ${P.rule}` }}
          />
        </div>

        <button
          onClick={onStart}
          style={{ padding: '16px 40px', background: P.ink, color: P.paper, border: 'none', fontFamily: '"IBM Plex Mono"', fontSize: 12, letterSpacing: 2, cursor: 'pointer', transition: 'opacity .15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          START EXERCISE →
        </button>
      </div>
    </div>
  );
}

// ── Case grid ───────────────────────────────────────────────────────────
function CaseGrid({ allAnswers, onSelect, onCompare, onBack }: {
  allAnswers: AllAnswers;
  onSelect: (c: Case) => void;
  onCompare: () => void;
  onBack: () => void;
}) {
  function caseStatus(kase: Case) {
    const ans = allAnswers[kase.id] ?? [];
    const answered = ans.filter((a: number | null) => a != null).length;
    if (answered === 0) return 'Not started';
    if (answered < 5) return 'In progress';
    return 'Completed';
  }

  function caseVerdict(kase: Case) {
    const ans = allAnswers[kase.id] ?? [];
    const answered = ans.filter((a: number | null) => a != null).length;
    if (answered === 0) return null;
    const score = ans.reduce((s: number, a: number | null, i: number) => s + (a == null ? 0 : kase.questions[i].options[a].score), 0);
    return verdictFor(score);
  }

  const allDone = CASES.every(c => caseStatus(c) === 'Completed');

  return (
    <div style={{ minHeight: '100vh', background: P.paper, color: P.ink, fontFamily: '"IBM Plex Sans"' }}>
      <div style={{ borderBottom: `1px solid ${P.rule}`, padding: '12px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2.5, color: P.inkSoft }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, color: P.inkSoft, cursor: 'pointer', padding: 0 }}>← OVERVIEW</button>
        <span>DISRUPTIVE&nbsp;·&nbsp;OR&nbsp;·&nbsp;SUSTAINING&nbsp;?</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 1.5, color: P.inkSoft }}>Developed by Jerry Kim</span>
          <button
            onClick={onCompare}
            style={{ background: 'transparent', border: `1px solid ${P.rule}`, fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.inkSoft, cursor: 'pointer', padding: '6px 12px' }}
          >
            COMPARE ALL →
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 56px 80px' }}>
        <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, color: P.accent, marginBottom: 12 }}>SELECT A CASE</div>
        <h2 style={{ margin: '0 0 40px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 36, fontWeight: 500, letterSpacing: -0.6, color: P.ink }}>
          Choose an innovation to evaluate
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {CASES.map((kase, idx) => {
            const status = caseStatus(kase);
            const verdict = caseVerdict(kase);
            const statusColor = status === 'Completed' ? P.accent : status === 'In progress' ? P.slate : P.ambig;

            return (
              <div
                key={kase.id}
                onClick={() => onSelect(kase)}
                style={{ background: P.card, border: `1px solid ${P.rule}`, padding: 0, cursor: 'pointer', transition: 'box-shadow .15s', overflow: 'hidden' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,.1)`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Photo strip */}
                <div style={{ height: 120, position: 'relative', overflow: 'hidden' }}>
                  <CasePhoto caseId={kase.id} height={120} />
                  <div style={{ position: 'absolute', top: 12, left: 16, fontFamily: '"IBM Plex Mono"', fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.75)', padding: '4px 8px', background: 'rgba(0,0,0,0.35)' }}>
                    CASE {String(idx + 1).padStart(2, '0')}
                  </div>
                </div>
                <div style={{ padding: '20px 24px 24px' }}>
                  <h3 style={{ margin: '0 0 8px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 22, fontWeight: 500, letterSpacing: -0.3, color: P.ink }}>{kase.title}</h3>
                  <p style={{ margin: '0 0 16px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 14, lineHeight: 1.55, color: P.inkSoft }}>
                    {kase.blurb.slice(0, 120)}…
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: statusColor }}>{status.toUpperCase()}</span>
                    {verdict && (
                      <span style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 1, color: P.inkSoft }}>{verdict.label}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allDone && (
          <div style={{ marginTop: 40, padding: '20px 24px', border: `1px solid ${P.rule}`, background: P.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 16, color: P.inkSoft }}>All four cases completed. Ready to compare?</p>
            <button
              onClick={onCompare}
              style={{ padding: '12px 28px', background: P.ink, color: P.paper, border: 'none', fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, cursor: 'pointer' }}
            >
              COMPARE ALL CASES →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Compare view ─────────────────────────────────────────────────────────
function CompareView({ allAnswers, onBack }: { allAnswers: AllAnswers; onBack: () => void }) {
  function getScore(kase: Case) {
    const ans = allAnswers[kase.id] ?? Array(5).fill(null);
    return ans.reduce((s: number, a: number | null, i: number) => s + (a == null ? 0 : kase.questions[i].options[a].score), 0);
  }
  function getAnswered(kase: Case) {
    const ans = allAnswers[kase.id] ?? [];
    return ans.filter((a: number | null) => a != null).length;
  }

  const discussionPrompts = [
    'Which case generated the most disagreement in your group? Why?',
    'Were there any cases where the same innovation could be classified differently depending on which customer segment you focus on?',
    'Christensen argued that Uber is sustaining, not disruptive. Do you agree or disagree? What evidence drives your view?',
    'Which innovation do you think poses the greatest long-term threat to incumbents? Does that match the disruptive classification?',
    'How does the time horizon of analysis change your classification? Can an innovation be sustaining at entry but disruptive later?',
  ];

  return (
    <div style={{ minHeight: '100vh', background: P.paper, color: P.ink, fontFamily: '"IBM Plex Sans"' }}>
      <div style={{ borderBottom: `1px solid ${P.rule}`, padding: '12px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2.5, color: P.inkSoft }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, color: P.inkSoft, cursor: 'pointer', padding: 0 }}>← BACK TO CASES</button>
        <span>DISRUPTIVE&nbsp;·&nbsp;OR&nbsp;·&nbsp;SUSTAINING&nbsp;?</span>
        <span style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 1.5 }}>Developed by Jerry Kim</span>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 56px 80px' }}>
        <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 11, letterSpacing: 2, color: P.accent, marginBottom: 12 }}>ALL CASES</div>
        <h2 style={{ margin: '0 0 40px', fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 36, fontWeight: 500, letterSpacing: -0.6, color: P.ink }}>
          Comparative results
        </h2>

        {/* Summary table */}
        <div style={{ borderTop: `1.5px solid ${P.ink}`, marginBottom: 48 }}>
          {CASES.map((kase, idx) => {
            const score = getScore(kase);
            const answered = getAnswered(kase);
            const verdict = verdictFor(score);
            const pct = Math.max(2, Math.min(98, ((score + 10) / 20) * 100));
            const verdictColor = verdict.side === 'sustaining' ? P.slate : verdict.side === 'disruptive' ? P.accent : P.ambig;

            return (
              <div key={kase.id} style={{ padding: '24px 0', borderBottom: `1px solid ${P.ruleSoft}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.inkSoft }}>CASE {String(idx + 1).padStart(2, '0')}</span>
                    <span style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 20, fontWeight: 500, color: P.ink }}>{kase.title}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 1, color: verdictColor }}>
                      {answered === 0 ? 'NOT STARTED' : verdict.label.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 1, color: P.inkSoft, marginLeft: 16 }}>
                      {answered === 0 ? '—' : (score > 0 ? `+${score}` : score)} {answered > 0 && `/ ${answered}/5`}
                    </span>
                  </div>
                </div>
                {/* Mini bar */}
                <div style={{ position: 'relative', height: 8, background: `linear-gradient(90deg, ${P.slate} 0%, ${P.slate} 20%, ${P.ambig} 50%, ${P.accent} 80%, ${P.accent} 100%)`, borderRadius: 1 }}>
                  {answered > 0 && (
                    <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: P.paper, border: `2.5px solid ${P.ink}`, boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: '"IBM Plex Mono"', fontSize: 9, letterSpacing: 1.5, color: P.inkSoft }}>
                  <span>SUSTAINING</span><span>AMBIGUOUS</span><span>DISRUPTIVE</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Discussion prompts */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ borderTop: `1.5px solid ${P.ink}`, paddingTop: 24 }}>
            <div style={{ fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.inkSoft, marginBottom: 16 }}>INSTRUCTOR DISCUSSION PROMPTS</div>
            <ol style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {discussionPrompts.map((prompt, i) => (
                <li key={i} style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 16, lineHeight: 1.6, color: P.inkSoft }}>
                  {prompt}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Reset */}
        <div style={{ borderTop: `1px solid ${P.ruleSoft}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 1, color: P.inkSoft }}>RESET ALL ANSWERS</p>
          <button
            onClick={() => {
              localStorage.removeItem('diagnostic:answers');
              window.location.reload();
            }}
            style={{ padding: '8px 20px', background: 'transparent', border: `1px solid ${P.rule}`, fontFamily: '"IBM Plex Mono"', fontSize: 10, letterSpacing: 2, color: P.inkSoft, cursor: 'pointer' }}
          >
            RESET →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [allAnswers, setAllAnswers] = useState<AllAnswers>(loadAnswers);

  useEffect(() => {
    saveAnswers(allAnswers);
  }, [allAnswers]);

  function handleAnswer(caseId: string, qi: number, oi: number) {
    setAllAnswers(prev => {
      const caseAnswers = prev[caseId] ? [...prev[caseId]] : Array(5).fill(null);
      caseAnswers[qi] = oi;
      return { ...prev, [caseId]: caseAnswers };
    });
  }

  if (screen === 'landing') {
    return <LandingPage onStart={() => setScreen('grid')} />;
  }

  if (screen === 'grid') {
    return (
      <CaseGrid
        allAnswers={allAnswers}
        onSelect={c => { setActiveCase(c); setScreen('diagnostic'); }}
        onCompare={() => setScreen('compare')}
        onBack={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'diagnostic' && activeCase) {
    const answers = allAnswers[activeCase.id] ?? Array(5).fill(null);
    return (
      <DiagnosticPage
        kase={activeCase}
        answers={answers}
        onAnswer={(qi, oi) => handleAnswer(activeCase.id, qi, oi)}
        onBack={() => setScreen('grid')}
      />
    );
  }

  if (screen === 'compare') {
    return <CompareView allAnswers={allAnswers} onBack={() => setScreen('grid')} />;
  }

  return null;
}
