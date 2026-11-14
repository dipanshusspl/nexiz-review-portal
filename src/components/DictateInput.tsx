'use client';
import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { MicIcon } from './Icons';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  /** page language: 'ar' -> the microphone writes Arabic, 'en' -> English */
  lang: 'en' | 'ar';
  startLabel: string;
  stopLabel: string;
};

/** A text input with a small "Dictate" button under it (browser speech recognition, language follows the page language). */
export default function DictateInput({ lang, startLabel, stopLabel, maxLength, ...rest }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const rec = useRef<{ stop(): void; abort(): void } | null>(null);
  const [on, setOn] = useState(false);
  const [can, setCan] = useState(false);

  useEffect(() => {
    const w = window as any;
    setCan(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => { try { rec.current?.abort(); } catch { /* already stopped */ } };
  }, []);

  function toggle() {
    if (on) { rec.current?.stop(); return; }
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    r.continuous = false; r.interimResults = false;
    r.onresult = (e: any) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
      text = text.trim();
      const el = ref.current;
      if (!text || !el) return;
      const next = ((el.value ? el.value.trimEnd() + ' ' : '') + text).slice(0, maxLength ?? 500);
      // set through the native setter so React's onChange (if any) also fires
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, next);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r;
    try { r.start(); setOn(true); } catch { setOn(false); }
  }

  return (
    <div className="dictate-field">
      <input ref={ref} maxLength={maxLength} {...rest} />
      {can && (
        <button type="button" className={on ? 'mic on' : 'mic'} onClick={toggle}><MicIcon /> {on ? stopLabel : startLabel}</button>
      )}
    </div>
  );
}
