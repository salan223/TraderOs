export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="27" height="27" rx="7.5" fill="#121216" stroke="#2e2e37" />
      <path d="M7 18.5 11.5 13l3.5 3 6-7.5" fill="none" stroke="#9488ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="8.5" r="1.6" fill="#9488ff" />
    </svg>
  );
}
