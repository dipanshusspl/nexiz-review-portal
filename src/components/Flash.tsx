export default function Flash({ ok, error, map }: { ok?: string; error?: string; map?: Record<string, string> }) {
  const text = (v: string) => map?.[v] ?? v;
  return (
    <>
      {ok && <div className="flash flash-ok" role="status">{text(ok)}</div>}
      {error && <div className="flash flash-err" role="alert">{text(error)}</div>}
    </>
  );
}
