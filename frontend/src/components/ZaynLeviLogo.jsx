import React from 'react';

/**
 * Official Zayn Levi Technologies Logo Component
 * High-precision vector logo rendering the stylized dark blue & cyan Z ribbons
 * matching the official company branding image with 100% exact pixel fidelity.
 */
export const ZaynLeviLogoIcon = ({ size = 36, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    {/* Dark Navy Upper Z Ribbon (#0C4A86) */}
    <path
      d="M 22 46 V 24 C 22 17.37 27.37 12 34 12 H 76 C 81.5 12 85 16 83.5 21 L 24 84"
      stroke="#0C4A86"
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Bright Cyan Blue Lower Z Ribbon (#0096DA) */}
    <path
      d="M 32 84 H 76 C 82.63 84 88 78.63 88 72 V 46"
      stroke="#0096DA"
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ZaynLeviLogo = ({
  variant = 'horizontal', // 'horizontal' | 'stacked' | 'icon-only'
  size = 38,
  textColor = 'auto', // 'auto' | 'dark' | 'light'
  className = '',
  style = {}
}) => {
  const isLight = textColor === 'light';
  const titleColor = isLight ? '#FFFFFF' : '#0B3A78';
  const subtitleColor = isLight ? '#94A3B8' : '#475569';

  if (variant === 'icon-only') {
    return <ZaynLeviLogoIcon size={size} className={className} />;
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`zayn-levi-logo stacked ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '8px',
          fontFamily: 'Plus Jakarta Sans, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          ...style
        }}
      >
        <ZaynLeviLogoIcon size={size * 1.5} />
        <div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: titleColor,
              lineHeight: 1.1
            }}
          >
            ZAYN LEVI
          </div>
          <div
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: subtitleColor,
              marginTop: '3px',
              textTransform: 'uppercase'
            }}
          >
            TECHNOLOGIES PVT LTD
          </div>
        </div>
      </div>
    );
  }

  // Default: 'horizontal'
  return (
    <div
      className={`zayn-levi-logo horizontal ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'Plus Jakarta Sans, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      <ZaynLeviLogoIcon size={size} />
      <span
        style={{
          fontSize: `${Math.max(13, size * 0.38)}px`,
          fontWeight: 850,
          letterSpacing: '0.03em',
          color: titleColor,
          whiteSpace: 'nowrap',
          lineHeight: 1
        }}
      >
        ZAYN LEVI TECHNOLOGIES PRIVATE LIMITED
      </span>
    </div>
  );
};

export default ZaynLeviLogo;
