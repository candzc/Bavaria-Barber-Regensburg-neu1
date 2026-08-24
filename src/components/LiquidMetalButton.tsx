import { useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

export interface LiquidMetalButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  viewMode?: 'text' | 'icon';
  variant?: 'dark' | 'light';
  className?: string;
}

type InteractionState = 'resting' | 'hover' | 'pressed';

// "Liquid Glass": immer transparenter Grund + dünner Rand, Schriftfarbe je
// nach Hintergrund invertiert (variant="dark" -> auf dunklem Hintergrund,
// darum helle/weiße Schrift; variant="light" -> auf hellem Hintergrund,
// darum dunkle/schwarze Schrift). Der Rand ist ein rotierender Gold/Wein-
// Farbverlauf per reinem CSS statt WebGL-Shader (siehe SESSION-NOTIZ unten:
// der @paper-design/shaders-react-Ansatz erwies sich als zu unzuverlässig —
// canUseShader/WebGL-Erkennung meldete zwar Erfolg, das Canvas blieb aber in
// mehreren Testumgebungen leer, ohne Fehler. Ein reiner CSS-Verlauf rendert
// garantiert identisch überall, ganz ohne WebGL-Abhängigkeit).
const PALETTES: Record<'dark' | 'light', Record<InteractionState, { surface: string; text: string }>> = {
  dark: {
    resting: { surface: 'rgba(250,248,246,0.06)', text: '#faf8f6' },
    hover: { surface: 'rgba(250,248,246,0.12)', text: '#faf8f6' },
    pressed: { surface: 'rgba(250,248,246,0.16)', text: '#faf8f6' },
  },
  light: {
    resting: { surface: 'rgba(28,26,24,0.04)', text: '#1c1a18' },
    hover: { surface: 'rgba(28,26,24,0.08)', text: '#1c1a18' },
    pressed: { surface: 'rgba(28,26,24,0.12)', text: '#1c1a18' },
  },
};

const SPIN_DURATION = { resting: '4s', hover: '1.6s', pressed: '1s' };

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function LiquidMetalButton({
  label,
  href,
  onClick,
  viewMode = 'text',
  variant = 'dark',
  className = '',
}: LiquidMetalButtonProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [pillWidth, setPillWidth] = useState<number | null>(null);
  const [state, setState] = useState<InteractionState>('resting');
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  // Dynamische Pill-Breite: Label-Breite per Canvas-Textmessung ermitteln
  // (nutzt den tatsaechlich gerenderten Font des Label-Elements), statt
  // eine feste Breite zu raten oder Layout-Shifts durch DOM-Messung zu riskieren.
  useLayoutEffect(() => {
    if (viewMode !== 'text' || !labelRef.current) return;
    const computed = getComputedStyle(labelRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
    const measured = ctx.measureText(label).width;
    const horizontalPadding = 56; // px-7 links+rechts, siehe Pill-Padding unten
    setPillWidth(Math.ceil(measured) + horizontalPadding);
  }, [label, viewMode]);

  const palette = PALETTES[variant][state];
  const isIcon = viewMode === 'icon';

  const spawnRipple = (e: ReactMouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = rippleId.current++;
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  const handlePointerDown = () => setState('pressed');
  const handlePointerUp = () => setState('hover');
  const handleMouseEnter = () => setState((s) => (s === 'pressed' ? s : 'hover'));
  const handleMouseLeave = () => setState('resting');

  const handleClick = (e: ReactMouseEvent<HTMLElement>) => {
    spawnRipple(e);
    onClick?.();
  };

  const Tag = href ? 'a' : 'button';

  return (
    <Tag
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      aria-label={isIcon ? label : undefined}
      className={`relative inline-flex min-h-[48px] select-none items-center justify-center overflow-hidden rounded-full backdrop-blur-md transition-[background-color,transform] duration-200 ${
        state === 'pressed' ? 'scale-[0.97]' : 'scale-100'
      } ${isIcon ? 'aspect-square w-12' : ''} ${className}`}
      style={{
        width: isIcon ? undefined : (pillWidth ?? undefined),
        backgroundColor: palette.surface,
        boxShadow: state === 'resting' ? '0 0 0 1px rgba(201,163,78,0.25)' : '0 0 14px rgba(201,163,78,0.45), 0 0 0 1px rgba(201,163,78,0.4)',
      }}
    >
      {/* Rand-Layer: rotierender Gold/Wein-Verlauf, nur als Ring sichtbar
          (mask-composite exclude spart die Innenfläche aus). Läuft per CSS-
          Animation, pausiert unter prefers-reduced-motion (siehe globale
          Regel in global.css, die alle animation-duration auf ~0 setzt). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          WebkitMaskImage: 'linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'source-out',
          maskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          maskClip: 'padding-box, border-box',
          padding: 4,
        }}
      >
        <span
          className="liquid-glass-ring block h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4"
          style={{ animationDuration: SPIN_DURATION[state] }}
        />
      </span>

      {/* Ripple-Layer */}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-gold/60"
          style={{
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            animation: 'liquid-metal-ripple 0.6s ease-out forwards',
          }}
        />
      ))}

      {/* Label-Layer */}
      <span
        ref={labelRef}
        className="relative z-10 whitespace-nowrap px-7 text-base font-semibold transition-colors duration-200"
        style={{ color: palette.text }}
      >
        {isIcon ? <span className="sr-only">{label}</span> : label}
        {isIcon && <PhoneIcon color={palette.text} />}
      </span>

      <style>{`
        @keyframes liquid-metal-ripple {
          from { transform: scale(0); opacity: 0.5; }
          to { transform: scale(24); opacity: 0; }
        }
        @keyframes liquid-glass-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .liquid-glass-ring {
          background: conic-gradient(from 0deg, #c9a34e, #e8c979, #c9a34e, #8a3540, #5e1c26, #8a3540, #c9a34e);
          animation-name: liquid-glass-spin;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </Tag>
  );
}

function PhoneIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
