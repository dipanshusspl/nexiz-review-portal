export default function Stepper({ step, labels }: { step: 1 | 2 | 3; labels: [string, string, string] }) {
  return (
    <ol className="stepper" aria-label="progress">
      {labels.map((label, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'current' : 'todo';
        return (
          <li key={n} className={`step ${state}`}>
            <span className="dot">{state === 'done' ? '✓' : n}</span>
            <span className="lbl">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
