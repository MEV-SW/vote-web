import {
  BarChart3,
  ClipboardList,
  LayoutGrid,
  QrCode,
  Settings,
  Vote,
  type LucideIcon,
} from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

export type GlassTone = 'default' | 'light';

export interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  onClick?: () => void;
  /** `light` — 흰 배경용 반투명 frosted glass */
  tone?: GlassTone;
}

const GLASS_TONE: Record<
  GlassTone,
  {
    shadow: string;
    blur: string;
    fill: string;
    inset: string;
    border?: string;
    distortion: boolean;
  }
> = {
  default: {
    shadow: '0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)',
    blur: 'blur(3px)',
    fill: 'rgba(255, 255, 255, 0.25)',
    inset:
      'inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)',
    distortion: true,
  },
  light: {
    shadow:
      '0 8px 32px rgba(15, 23, 42, 0.07), 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 0 0 1px rgba(255, 255, 255, 0.5)',
    blur: 'blur(20px) saturate(1.35)',
    fill: 'rgba(255, 255, 255, 0.55)',
    inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.75)',
    distortion: false,
  },
};

export interface DockIcon {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

const glassTransition = 'cubic-bezier(0.175, 0.885, 0.32, 2.2)';

export const LIQUID_GLASS_BG =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80';

export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = '',
  style = {},
  href,
  target = '_blank',
  onClick,
  tone = 'default',
}) => {
  const preset = GLASS_TONE[tone];
  const glassStyle: React.CSSProperties = {
    boxShadow: preset.shadow,
    border: preset.border,
    transitionTimingFunction: glassTransition,
    ...style,
  };

  const content = (
    <div
      className={cn(
        'relative flex overflow-hidden text-[var(--ink,#111)] transition-all duration-700',
        tone === 'light' && 'glass-tone-light',
        (href || onClick) && 'cursor-pointer',
        className,
      )}
      style={glassStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{
          backdropFilter: preset.blur,
          WebkitBackdropFilter: preset.blur,
          filter: preset.distortion ? 'url(#glass-distortion)' : undefined,
          isolation: 'isolate',
        }}
      />
      <div
        className="absolute inset-0 z-10 rounded-[inherit]"
        style={{ background: preset.fill }}
      />
      <div
        className="absolute inset-0 z-20 overflow-hidden rounded-[inherit] pointer-events-none"
        style={{ boxShadow: preset.inset }}
      />
      <div className="relative z-30 w-full">{children}</div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target={target} rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
};

export const GlassDock: React.FC<{ icons: DockIcon[]; href?: string; className?: string }> = ({
  icons,
  href,
  className,
}) => (
  <GlassEffect href={href} className={cn('rounded-3xl p-3 hover:p-4 hover:rounded-[2rem]', className)}>
    <div className="flex items-center justify-center gap-3 overflow-hidden rounded-3xl px-2 py-1">
      {icons.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={`${item.label}-${index}`}
            type="button"
            aria-label={item.label}
            className="grid size-14 place-items-center rounded-2xl text-white/90 transition-all duration-700 hover:scale-110 hover:bg-white/10"
            style={{
              transformOrigin: 'center center',
              transitionTimingFunction: glassTransition,
            }}
            onClick={item.onClick}
          >
            <Icon className="size-7" strokeWidth={1.6} aria-hidden />
          </button>
        );
      })}
    </div>
  </GlassEffect>
);

export const GlassButton: React.FC<{
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}> = ({ children, href, className, onClick }) => (
  <GlassEffect
    href={href}
    onClick={onClick}
    className={cn(
      'rounded-3xl px-10 py-6 font-semibold hover:rounded-[2rem] hover:px-11 hover:py-7',
      className,
    )}
  >
    <div
      className="transition-all duration-700 hover:scale-95"
      style={{ transitionTimingFunction: glassTransition }}
    >
      {children}
    </div>
  </GlassEffect>
);

export const GlassFilter: React.FC = () => (
  <svg style={{ display: 'none' }} aria-hidden>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves={1}
        seed={17}
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
        <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
        <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale={5}
        specularConstant={1}
        specularExponent={100}
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x={-200} y={-200} z={300} />
      </feSpecularLighting>
      <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litImage" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale={200}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

/** Full-screen demo showcase */
export const Component = () => {
  const dockIcons: DockIcon[] = [
    { icon: Vote, label: '투표' },
    { icon: ClipboardList, label: '폼' },
    { icon: BarChart3, label: '결과' },
    { icon: QrCode, label: 'QR' },
    { icon: LayoutGrid, label: '허브' },
    { icon: Settings, label: '설정' },
  ];

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden font-light"
      style={{
        backgroundImage: `url("${LIQUID_GLASS_BG}")`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        animation: 'moveBackground 60s linear infinite',
      }}
    >
      <GlassFilter />

      <div className="flex w-full flex-col items-center justify-center gap-6 px-4">
        <GlassDock icons={dockIcons} />

        <GlassButton>
          <div className="text-xl text-white">
            <p>오늘 어떤 투표에 참여할까요?</p>
          </div>
        </GlassButton>
      </div>
    </div>
  );
};
