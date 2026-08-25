/**
 * MonogramAvatar (design.md 7.10) — initials on a deterministic dark gradient
 * derived from a name hash, with a thin orange arc bottom-left echoing the logo.
 * Square, rounded-lg. Used for athletes, scouts and personas (no fake faces).
 */
import { cn } from '@/lib/utils';

const PALETTES: [string, string][] = [
  ['#0A0A0B', '#1C1D21'], // ink -> ink-800
  ['#0A0A0B', '#3B2F24'], // ink -> warm
  ['#0A0A0B', '#2A2C31'], // ink -> ink-700
];

function hash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function MonogramAvatar({
  name,
  size = 48,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const [from, to] = PALETTES[hash(name) % PALETTES.length];
  const fontSize = Math.max(10, Math.round(size * 0.34));
  return (
    <div
      aria-hidden
      className={cn('relative shrink-0 overflow-hidden rounded-lg', className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M -10 78 A 40 40 0 0 1 34 106" stroke="#F97316" strokeWidth="3" fill="none" />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-white"
        style={{ fontSize }}
      >
        {initialsOf(name)}
      </span>
    </div>
  );
}
