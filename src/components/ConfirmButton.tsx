'use client';

export default function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button className={className ?? 'btn-danger'} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
