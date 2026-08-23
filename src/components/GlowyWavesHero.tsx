import { motion, type Variants } from 'framer-motion';
import { Scissors } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { business } from '@/lib/site';

type Point = { x: number; y: number };
interface WaveConfig {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
}

const highlightPills = ['Ohne Termin', 'Am Galgenberg', 'Vierköpfiges Team'] as const;

const heroStats: { label: string; value: string }[] = [
  { label: 'Jahre Erfahrung', value: '20+' },
  { label: 'Google-Bewertung', value: '4.8★' },
  { label: 'Rezensionen', value: business.reviewCount },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const statsVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function GlowyWavesHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouseInfluence = prefersReducedMotion ? 10 : 70;
    const influenceRadius = prefersReducedMotion ? 160 : 320;
    const smoothing = prefersReducedMotion ? 0.04 : 0.1;

    let width = 0;
    let height = 0;
    let rafId = 0;

    const computeThemeColors = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        background: styles.getPropertyValue('--color-background').trim() || '#faf8f6',
        muted: styles.getPropertyValue('--color-muted').trim() || '#f1ede9',
        primary: styles.getPropertyValue('--color-primary').trim() || '#5e1c26',
        accent: styles.getPropertyValue('--color-accent').trim() || '#8a3540',
        foreground: styles.getPropertyValue('--color-foreground').trim() || '#1c1a18',
      };
    };

    let theme = computeThemeColors();

    const observer = new MutationObserver(() => {
      theme = computeThemeColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      targetMouseRef.current = { x: width / 2, y: height / 2 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const waves: WaveConfig[] = [
      { offset: 0, amplitude: 26, frequency: 0.006, color: theme.primary, opacity: 0.16 },
      { offset: Math.PI / 3, amplitude: 34, frequency: 0.004, color: theme.accent, opacity: 0.12 },
      { offset: Math.PI / 1.5, amplitude: 20, frequency: 0.008, color: theme.foreground, opacity: 0.06 },
    ];

    const drawWave = (wave: WaveConfig, time: number) => {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let x = 0; x <= width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = height / 2 - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / influenceRadius) * mouseInfluence;
        const y =
          height / 2 +
          Math.sin(x * wave.frequency + time + wave.offset) * (wave.amplitude + influence);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    let time = 0;
    const animate = () => {
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * smoothing;

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, theme.background);
      gradient.addColorStop(1, theme.muted);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      waves.forEach((wave) => drawWave(wave, time));
      time += prefersReducedMotion ? 0.004 : 0.012;
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      className="relative isolate flex min-h-[80vh] w-full items-center justify-center overflow-hidden bg-background"
      role="region"
      aria-label="Bavaria Barber Regensburg – Vorstellung"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-foreground/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:px-8 lg:px-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
          <motion.div
            variants={itemVariants}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-medium text-foreground"
          >
            <Scissors className="h-4 w-4 text-primary" />
            Seit {business.founded} am Galgenberg in Regensburg
          </motion.div>

          <motion.h2 variants={itemVariants} className="mt-6 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
            Herrenfriseur mit Handwerk und Erfahrung
          </motion.h2>

          <motion.p variants={itemVariants} className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Unser vierköpfiges Team schneidet seit über 20 Jahren Haare am Galgenberg – ohne Terminzwang,
            mit kurzen Wartezeiten und demselben Anspruch an Präzision bei jedem Besuch.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${business.phoneHref.replace('tel:', '')}`}
              className={cn(
                'inline-flex min-h-[44px] min-w-[220px] items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-wine-dark'
              )}
            >
              {business.phone} anrufen
            </a>
            <a
              href="/leistungen"
              className={cn(
                'inline-flex min-h-[44px] min-w-[220px] items-center justify-center rounded-full border border-border bg-transparent px-6 text-sm font-semibold tracking-wide text-foreground transition-colors duration-200 hover:bg-muted'
              )}
            >
              Leistungen ansehen
            </a>
          </motion.div>

          <motion.ul variants={itemVariants} className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {highlightPills.map((pill) => (
              <li
                key={pill}
                className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {pill}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={statsVariants} className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl text-primary sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
