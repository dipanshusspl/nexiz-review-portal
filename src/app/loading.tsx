/** Shown by Next.js while a page is being prepared on the server (every page change, every redirect). */
export default function Loading() {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      <span className="muted small">Loading… / جارٍ التحميل…</span>
    </div>
  );
}
