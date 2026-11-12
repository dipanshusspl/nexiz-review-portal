'use client';

/** Failure message when something unexpected breaks on a page, with a way to try again. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-loading" role="alert">
      <div className="toast toast-err" style={{ maxWidth: 420 }}>
        <span className="toast-ico" aria-hidden>!</span>
        <span className="toast-text">Something went wrong. Please try again. / حدث خطأ. حاول مرة أخرى.</span>
      </div>
      <button className="btn-primary" onClick={() => reset()}>Try again / حاول مجددًا</button>
    </div>
  );
}
