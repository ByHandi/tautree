/**
 * Tautree brand mark — a node branching from one root into many leaves
 * ("taut"/link + tree; one link → all your links). Single-color, inherits
 * `currentColor`, so it adapts to whatever context it sits in.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Tautree"
    >
      {/* trunk + center branch */}
      <path d="M16 27.5V6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* left branch */}
      <path
        d="M16 17C13 16 9.5 15 6.5 9.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* right branch */}
      <path
        d="M16 17C19 16 22.5 15 25.5 9.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* nodes */}
      <circle cx="16" cy="28" r="2.6" fill="currentColor" />
      <circle cx="16" cy="6" r="2.6" fill="currentColor" />
      <circle cx="6" cy="9" r="2.6" fill="currentColor" />
      <circle cx="26" cy="9" r="2.6" fill="currentColor" />
    </svg>
  );
}

export default Logo;
