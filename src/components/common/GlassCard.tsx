import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  dense?: boolean;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  hoverEffect = false,
  dense = false,
  className = '',
  glow = false,
  style,
  ...props
}) => {
  return (
    <div
      className={`glass-card ${hoverEffect ? 'glass-card-hover' : ''} ${className}`}
      style={{
        padding: dense ? '14px 18px' : '22px 24px',
        boxShadow: glow ? '0 0 25px var(--theme-glow)' : undefined,
        ...style,
      }}
      role={props.onClick ? 'button' : undefined}
      tabIndex={props.onClick ? 0 : undefined}
      onKeyDown={props.onClick ? e => {if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.click();}} : undefined}
      {...props}
    >
      {children}
    </div>
  );
};


