export function Logo({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SILVER LEAGUE"
    >
      <text
        x="100"
        y="28"
        textAnchor="middle"
        fontFamily="Bodoni Moda, Georgia, serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="3"
        fill={color}
      >
        SILVER
      </text>
      <text
        x="100"
        y="50"
        textAnchor="middle"
        fontFamily="Bodoni Moda, Georgia, serif"
        fontSize="14"
        fontWeight="400"
        letterSpacing="6"
        fill={color}
      >
        LEAGUE
      </text>
      <line x1="40" y1="36" x2="160" y2="36" stroke={color} strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

export function LogoMark({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <div className={className} style={{ color }}>
      <div className="font-display font-bold tracking-luxe text-lg leading-none">SILVER</div>
      <div className="font-display tracking-wider-luxe text-[10px] leading-tight mt-0.5">LEAGUE</div>
    </div>
  );
}
