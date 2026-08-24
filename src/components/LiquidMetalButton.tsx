import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { LiquidMetal } from '@paper-design/shaders-react';

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
// darum dunkle/schwarze Schrift), damit der Button auf jedem Untergrund
// lesbar bleibt. Der LiquidMetal-Shader läuft nur noch als feiner, dezenter
// Rand-Schimmer (siehe Ring-Layer weiter unten), nicht mehr als Flächenfüllung.
const PALETTES: Record<'dark' | 'light', Record<InteractionState, { surface: string; border: string; text: string; colorBack: string; colorTint: string }>> = {
  dark: {
    resting: {
      surface: 'rgba(250,248,246,0.06)',
      border: 'rgba(250,248,246,0.35)',
      text: '#faf8f6',
      colorBack: '#1c1a18',
      colorTint: '#c9a34e',
    },
    hover: {
      surface: 'rgba(250,248,246,0.12)',
      border: 'rgba(250,248,246,0.55)',
      text: '#faf8f6',
      colorBack: '#1c1a18',
      colorTint: '#c9a34e',
    },
    pressed: {
      surface: 'rgba(250,248,246,0.16)',
      border: 'rgba(250,248,246,0.65)',
      text: '#faf8f6',
      colorBack: '#1c1a18',
      colorTint: '#c9a34e',
    },
  },
  light: {
    resting: {
      surface: 'rgba(28,26,24,0.04)',
      border: 'rgba(28,26,24,0.25)',
      text: '#1c1a18',
      colorBack: '#faf8f6',
      colorTint: '#c9a34e',
    },
    hover: {
      surface: 'rgba(28,26,24,0.08)',
      border: 'rgba(28,26,24,0.4)',
      text: '#1c1a18',
      colorBack: '#faf8f6',
      colorTint: '#c9a34e',
    },
    pressed: {
      surface: 'rgba(28,26,24,0.12)',
      border: 'rgba(28,26,24,0.5)',
      text: '#1c1a18',
      colorBack: '#faf8f6',
      colorTint: '#c9a34e',
    },
  },
};

const SPEED = { resting: 0.4, hover: 1, pressed: 1.4 };

interface Ripple {
  id: number;
  x: number;
  y: number;
}

// Fallback fuer Browser/Geraete ohne WebGL oder mit prefers-reduced-motion:
// normaler CSS-Button ohne Shader-Layer, gleiche Farben/Groesse/Klickflaeche.
function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
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
  const [canUseShader, setCanUseShader] = useState(false);
  const rippleId = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanUseShader(!reduceMotion && supportsWebGL());
  }, []);

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

  // Low-Power-/No-JS-Fallback: einfacher transparenter Rand-Button, kein
  // WebGL-Layer, aber dieselbe Transparenz + kontrastierende Schriftfarbe.
  if (!canUseShader) {
    const Tag = href ? 'a' : 'button';
    return (
      <Tag
        href={href}
        onClick={onClick}
        className={`inline-flex min-h-[48px] items-center justify-center rounded-full border px-7 text-base font-semibold backdrop-blur-md transition-colors ${
          variant === 'dark'
            ? 'border-paper/35 bg-paper/5 text-paper hover:bg-paper/10'
            : 'border-ink/25 bg-ink/[0.03] text-ink hover:bg-ink/[0.07]'
        } ${isIcon ? 'aspect-square !px-0 w-12' : ''} ${className}`}
        aria-label={isIcon ? label : undefined}
      >
        {isIcon ? <PhoneIcon /> : label}
      </Tag>
    );
  }

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
      className={`relative inline-flex min-h-[48px] select-none items-center justify-center overflow-hidden rounded-full border backdrop-blur-md transition-[border-color,background-color,transform] duration-200 ${
        state === 'pressed' ? 'scale-[0.97]' : 'scale-100'
      } ${isIcon ? 'aspect-square w-12' : ''} ${className}`}
      style={{
        width: isIcon ? undefined : (pillWidth ?? undefined),
        borderColor: palette.border,
        backgroundColor: palette.surface,
      }}
    >
      {/* Shader-Ring-Layer: LiquidMetal nur als Rand sichtbar (Mask carved), dezenter Gold-Schimmer */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[2px] rounded-full opacity-60"
        style={{
          WebkitMaskImage:
            'linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'source-out',
          maskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          maskClip: 'padding-box, border-box',
          padding: 3,
        }}
      >
        <LiquidMetal
          style={{ width: '100%', height: '100%' }}
          colorBack={palette.colorBack}
          colorTint={palette.colorTint}
          speed={SPEED[state]}
          shape="metaballs"
          softness={0.6}
          contour={0.5}
          distortion={0.15}
        />
      </span>

      {/* Ripple-Layer */}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-paper/50"
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
