'use client';
import { useEffect, useRef, useState } from 'react';
import { submitReview } from '@/app/actions/review';

type Opt = { value: string; label: string };
type Initial = {
  rating: number; duration: string; pros: string; cons: string; recommend: 'yes' | 'no' | ''; role: string; size: string;
  zatca: string; stillUsing: 'yes' | 'no' | ''; movedTo: string; ease: number; support: number; value: number; anonymous: boolean;
};
type Props = {
  category: string; software: string; softwareName: string; lang: 'en' | 'ar';
  initial: Initial | null;
  durations: Opt[]; roles: Opt[]; sizes: Opt[]; zatcaOptions: Opt[];
  needsZatca: boolean; fieldAgent: boolean; agentName: string;
  others: Opt[];                       // other products in this category, for "What did you move to?"
  t: Record<string, string>;
  isUpdate: boolean;
};

type SR = { start(): void; stop(): void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: any) => void) | null; onend: (() => void) | null };

/** one row of pills; clicking the selected pill again clears it when `clearable` */
function Pills({ options, value, onChange, clearable = false }: { options: Opt[]; value: string; onChange: (v: string) => void; clearable?: boolean }) {
  return (
    <div className="pills">
      {options.map((o) => (
        <button type="button" key={o.value} className={value === o.value ? 'pill on' : 'pill'} aria-pressed={value === o.value}
          onClick={() => onChange(clearable && value === o.value ? '' : o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export default function ReviewForm({ category, software, softwareName, lang, initial, durations, roles, sizes, zatcaOptions, needsZatca, fieldAgent, agentName, others, t, isUpdate }: Props) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [duration, setDuration] = useState(initial?.duration ?? '');
  const [pros, setPros] = useState(initial?.pros ?? '');
  const [cons, setCons] = useState(initial?.cons ?? '');
  const [recommend, setRecommend] = useState<string>(initial?.recommend ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [size, setSize] = useState(initial?.size ?? '');
  const [zatca, setZatca] = useState(initial?.zatca ?? '');
  const [stillUsing, setStillUsing] = useState<string>(initial?.stillUsing ?? '');
  const [movedTo, setMovedTo] = useState(initial?.movedTo ?? '');
  const [ease, setEase] = useState(String(initial?.ease || ''));
  const [support, setSupport] = useState(String(initial?.support || ''));
  const [value, setValue] = useState(String(initial?.value || ''));
  const [anonymous, setAnonymous] = useState(initial?.anonymous ?? false);
  const [fieldMode, setFieldMode] = useState(false);
  const [listening, setListening] = useState<'pros' | 'cons' | null>(null);
  const [canSpeak, setCanSpeak] = useState(false);
  const rec = useRef<SR | null>(null);

  useEffect(() => {
    const w = window as any;
    setCanSpeak(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function toggleMic(target: 'pros' | 'cons') {
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) { rec.current?.stop(); if (listening === target) return; }
    const set = target === 'pros' ? setPros : setCons;
    const r: SR = new Ctor();
    r.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    r.continuous = true; r.interimResults = false;
    r.onresult = (e: any) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
      if (text) set((c) => ((c ? c.trimEnd() + ' ' : '') + text.trim()).slice(0, 200));
    };
    r.onend = () => setListening((cur) => (cur === target ? null : cur));
    rec.current = r; r.start(); setListening(target);
  }

  const shown = hover || rating;
  const ok =
    !!rating && !!duration && pros.trim().length >= 20 && cons.trim().length >= 20 && !!recommend && !!role && !!size && !!stillUsing &&
    (!needsZatca || !!zatca);
  const five = ['1', '2', '3', '4', '5'].map((n) => ({ value: n, label: n }));
  const yn: Opt[] = [{ value: 'yes', label: t.yes }, { value: 'no', label: t.no }];

  const textBox = (id: 'pros' | 'cons', label: string, val: string, set: (s: string) => void) => (
    <>
      <h4>{label} *</h4>
      <textarea name={id} value={val} maxLength={200} rows={3} required minLength={20}
        onChange={(e) => set(e.target.value)} placeholder={`${t.sharePlaceholder} ${softwareName}...`} />
      <div className="review-foot">
        {canSpeak ? (
          <button type="button" className={listening === id ? 'mic on' : 'mic'} onClick={() => toggleMic(id)}>🎤 {listening === id ? t.stop : t.record}</button>
        ) : <span />}
        <span className={val.trim().length < 20 ? 'count low' : 'count'}>{val.length}/200 · {t.min20}</span>
      </div>
    </>
  );

  return (
    <form action={submitReview} className="review-form">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="software" value={software} />
      <input type="hidden" name="rating" value={rating || ''} />
      <input type="hidden" name="duration" value={duration} />
      <input type="hidden" name="would_recommend" value={recommend} />
      <input type="hidden" name="reviewer_role" value={role} />
      <input type="hidden" name="company_size" value={size} />
      <input type="hidden" name="zatca_status" value={zatca} />
      <input type="hidden" name="still_using" value={stillUsing} />
      <input type="hidden" name="moved_to" value={stillUsing === 'no' ? movedTo : ''} />
      <input type="hidden" name="rating_ease" value={ease} />
      <input type="hidden" name="rating_support" value={support} />
      <input type="hidden" name="rating_value" value={value} />

      <p className="muted small takes">⏱ {t.takes60}</p>
      {isUpdate && <p className="muted small">{t.youReviewed}</p>}

      {/* P7 — field agents only */}
      {fieldAgent && (
        <div className="field-box">
          <label className="check"><input type="checkbox" name="field_mode" checked={fieldMode} onChange={(e) => setFieldMode(e.target.checked)} /> {t.collectingFor}</label>
          {fieldMode && (
            <div className="form-stack">
              <p className="muted small">{t.respHint}</p>
              <label>{t.respName} *<input name="resp_name" required maxLength={120} /></label>
              <label>{t.respContact} *<input name="resp_contact" required maxLength={254} dir="ltr" /></label>
              <label>{t.respCompany} *<input name="resp_company" required maxLength={120} /></label>
              <label>{t.collectedBy}<input value={agentName} readOnly disabled /></label>
            </div>
          )}
        </div>
      )}

      {/* P3 — who is reviewing (above the rating) */}
      <h4>{t.whoReviewing}</h4>
      <p className="muted small">{t.yourRole} *</p>
      <Pills options={roles} value={role} onChange={setRole} />
      <p className="muted small gap">{t.companySize} *</p>
      <Pills options={sizes} value={size} onChange={setSize} />

      {/* rating + P2 recommend + P6 sub-ratings */}
      <h4>{t.yourRating} *</h4>
      <div className="stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} className={n <= shown ? 'star on' : 'star'} aria-label={`${n}`}
            onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>★</button>
        ))}
        <span className="rating-text">{rating ? `${rating}.0 / 5` : ''}</span>
      </div>

      <h4>{t.recommendQ} *</h4>
      <Pills options={yn} value={recommend} onChange={setRecommend} />

      <details className="subratings">
        <summary>{t.subRatings}</summary>
        {([[t.ease, ease, setEase], [t.support, support, setSupport], [t.value, value, setValue]] as const).map(([label, val, set]) => (
          <div key={label} className="subrow"><span>{label}</span><Pills options={five} value={val} onChange={set} clearable /></div>
        ))}
      </details>

      {/* A1 — shared duration list */}
      <h4>{t.howLong} *</h4>
      <Pills options={durations} value={duration} onChange={setDuration} />

      {/* P4 — ZATCA, only in the 4 relevant categories */}
      {needsZatca && (<><h4>{t.zatcaQ} *</h4><Pills options={zatcaOptions} value={zatca} onChange={setZatca} /></>)}

      {/* P5 — churn */}
      <h4>{t.stillUsing} *</h4>
      <Pills options={yn} value={stillUsing} onChange={setStillUsing} />
      {stillUsing === 'no' && (
        <label className="moved">{t.movedTo}
          <select value={movedTo} onChange={(e) => setMovedTo(e.target.value)}>
            <option value="">{t.selectOne}</option>
            {others.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      )}

      {/* P1 — two text boxes */}
      {textBox('pros', t.worksWell, pros, setPros)}
      {textBox('cons', t.doesntWork, cons, setCons)}

      {/* A5 — per-review anonymity, default OFF */}
      <label className="check anon"><input type="checkbox" name="anonymous" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} /> {t.anonLabel}</label>

      <div className="submit-row">
        <button className="btn-primary" disabled={!ok}>{isUpdate ? t.update : t.submit} →</button>
      </div>
    </form>
  );
}
