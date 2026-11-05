/**
 * A perfume bottle drawn in pencil. A displacement filter makes the lines wobble like a hand-drawn
 * sketch; with `colors`, a watercolour wash rises inside the body as if the bottle were being filled.
 */
export default function BottleSketch({ colors, className }: { colors?: [string, string]; className?: string }) {
  const body = "M70 150 C70 128 82 118 100 116 L180 116 C198 118 210 128 210 150 L210 318 C210 334 198 344 182 344 L98 344 C82 344 70 334 70 318 Z";
  return (
    <svg className={className} viewBox="0 0 280 380" fill="none" aria-hidden>
      <defs>
        <filter id="ml-pencil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.6" />
        </filter>
        <filter id="ml-wash" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
        <linearGradient id="ml-wash-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors?.[1] ?? "#c9a24a"} stopOpacity="0.85" />
          <stop offset="1" stopColor={colors?.[0] ?? "#2a2414"} stopOpacity="0.95" />
        </linearGradient>
        <clipPath id="ml-body">
          <path d={body} />
        </clipPath>
      </defs>

      {colors && (
        <g clipPath="url(#ml-body)">
          <rect className="ml-wash" x="40" y="100" width="200" height="260" fill="url(#ml-wash-fill)" filter="url(#ml-wash)" />
        </g>
      )}

      <g className="ml-lines" filter="url(#ml-pencil)">
        {/* cap */}
        <path pathLength={1} d="M112 30 L168 30 L172 78 L108 78 Z" />
        <path pathLength={1} d="M114 36 L166 36" opacity="0.5" />
        {/* neck */}
        <path pathLength={1} d="M122 78 L122 100 M158 78 L158 100 M114 100 L166 100 L170 116 L110 116 Z" />
        {/* body, drawn twice slightly offset like a sketch */}
        <path pathLength={1} d={body} />
        <path pathLength={1} d={body} transform="translate(2 -1.5)" opacity="0.45" />
        {/* label */}
        <path pathLength={1} d="M100 206 L180 206 L180 266 L100 266 Z" />
        <path pathLength={1} d="M112 228 L168 228 M120 244 L160 244" opacity="0.6" />
        {/* highlight hatching */}
        <path pathLength={1} d="M86 160 L86 300 M94 150 L94 220" opacity="0.4" />
        {/* sparkle */}
        <path pathLength={1} d="M232 70 L232 98 M218 84 L246 84" opacity="0.7" />
      </g>
    </svg>
  );
}
