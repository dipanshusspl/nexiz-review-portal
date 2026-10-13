'use client';
import { useEffect, useRef, useState } from 'react';
import { submitReview } from '@/app/actions/review';

type Props = {
  category: string; software: string; softwareName: string; lang: 'en' | 'ar';
  initial: { rating: number; duration: string; comment: string } | null;
  durations: { value: string; label: string }[];
  labels: { yourRating: string; outOf5: string; howLong: string; yourReview: string; placeholder: string; record: string; stop: string; submit: string };
};

type SR = { start(): void; stop(): void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: any) => void) | null; onend: (() => void) | null };

export default function ReviewForm({ category, software, softwareName, lang, initial, durations, labels }: Props) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [duration, setDuration] = useState(initial?.duration ?? '');
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const rec = useRef<SR | null>(null);

  useEffect(() => {
    const w = window as any;
    setCanSpeak(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function toggleMic() {
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) { rec.current?.stop(); return; }
    const r: SR = new Ctor();
    r.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    r.continuous = true; r.interimResults = false;
    r.onresult = (e: any) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
      if (text) setComment((c) => (c ? c.trimEnd() + ' ' : '') + text.trim());
    };
    r.onend = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  }

  const shown = hover || rating;
  return (
    <form action={submitReview} className="review-form">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="software" value={software} />
      <input type="hidden" name="rating" value={rating || ''} />
      <input type="hidden" name="duration" value={duration} />

      <h4>{labels.yourRating}</h4>
      <div className="stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} className={n <= shown ? 'star on' : 'star'} aria-label={`${n}`}
            onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>★</button>
        ))}
        <span className="rating-text">{rating ? `${rating}.0 / 5` : ''}</span>
      </div>

      <h4>{labels.howLong}</h4>
      <div className="pills">
        {durations.map((d) => (
          <button type="button" key={d.value} className={duration === d.value ? 'pill on' : 'pill'} onClick={() => setDuration(d.value)}>{d.label}</button>
        ))}
      </div>

      <h4>{labels.yourReview}</h4>
      <textarea name="comment" value={comment} maxLength={1000} rows={5}
        onChange={(e) => setComment(e.target.value)} placeholder={`${labels.placeholder} ${softwareName}...`} />
      <div className="review-foot">
        {canSpeak ? (
          <button type="button" className={listening ? 'mic on' : 'mic'} onClick={toggleMic}>🎤 {listening ? labels.stop : labels.record}</button>
        ) : <span />}
        <span className="count">{comment.length}/1000</span>
      </div>
      <div className="submit-row">
        <button className="btn-primary" disabled={!rating || !duration}>{labels.submit} →</button>
      </div>
    </form>
  );
}
