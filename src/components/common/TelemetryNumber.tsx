import React,{useEffect,useRef,useState} from 'react';
import {useThemeStore} from '../../store/useThemeStore';

interface TelemetryNumberProps {
  value: string | number;
  label?: string;
  unit?: string;
  status?: 'vital' | 'caution' | 'alert' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TelemetryNumber: React.FC<TelemetryNumberProps> = ({
  value,
  label,
  unit,
  status = 'neutral',
  size = 'md',
}) => {
  const motion=useThemeStore(s=>s.motion);const [display,setDisplay]=useState(value);const previous=useRef(value);
  useEffect(()=>{if(typeof value!=='number'||typeof previous.current!=='number'||motion==='none'||matchMedia('(prefers-reduced-motion: reduce)').matches){setDisplay(value);previous.current=value;return;}const start=performance.now(),from=previous.current;let frame:number;const tick=(now:number)=>{const t=Math.min(1,(now-start)/450);const next=from+(value-from)*(1-(1-t)**3);setDisplay(Number(next.toFixed(Number.isInteger(value)?0:1)));if(t<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);previous.current=value;return()=>cancelAnimationFrame(frame);},[value,motion]);
  const getStatusColor = () => {
    switch (status) {
      case 'vital': return 'var(--status-vital)';
      case 'caution': return 'var(--status-caution)';
      case 'alert': return 'var(--status-alert)';
      default: return 'var(--theme-text-main)';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return '16px';
      case 'lg': return '28px';
      case 'xl': return '38px';
      default: return '22px';
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
      {label && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--theme-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span
          className="text-numeral"
          style={{
            fontSize: getFontSize(),
            fontWeight: 700,
            color: getStatusColor(),
            lineHeight: 1.1,
          }}
        >
          {display}
        </span>
        {unit && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--theme-text-muted)',
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};
