import {useDialog} from '../common/useDialog';
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, Wind, X, ExternalLink, Heart } from 'lucide-react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { GlassCard } from '../common/GlassCard';

export const SOSModal: React.FC = () => {
  const { isSosOpen, openSos } = useNavigationStore();
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);

  // Box-Breathing Grounding Cadence (4s in, 4s hold, 4s out, 4s hold)
  useEffect(() => {
    if (!isSosOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setBreathPhase((current) => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            if (current === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSosOpen]);

  const dialog=useDialog(isSosOpen,()=>openSos(false));
  if (!isSosOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => openSos(false)}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Support and grounding" className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(244, 63, 94, 0.25)',
            background: 'rgba(244, 63, 94, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-alert)',
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>Crisis & Safety Support</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Immediate grounding and verified crisis resources
              </div>
            </div>
          </div>

          <button
            className="btn-icon"
            onClick={() => openSos(false)}
            style={{ background: 'transparent', border: 'none', color: '#fff' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Grounding Box Breathing Visualizer */}
          <GlassCard style={{ textAlign: 'center', padding: '24px', border: '1px solid var(--theme-border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--companion-gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Autonomic Nervous Grounding
            </div>
            <div style={{ margin: '18px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(250, 204, 21, 0.25) 0%, transparent 70%)',
                  border: '2px solid var(--companion-gold-bright)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 1s ease-in-out',
                  transform: breathPhase === 'Inhale' ? 'scale(1.15)' : breathPhase === 'Exhale' ? 'scale(0.9)' : 'scale(1)',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--theme-text-main)' }}>{breathPhase}</span>
                <span className="text-numeral" style={{ fontSize: '18px', color: 'var(--companion-gold)', fontWeight: 700 }}>{secondsLeft}s</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
              Follow the circle. Box-breathing calms the heart rate by regulating oxygen levels in the blood.
            </p>
          </GlassCard>

          {/* Verified Crisis Helpline Numbers */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--theme-text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Verified Helplines (24/7 Free & Confidential)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Tele-MANAS */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-veil)',
                  border: '1px solid var(--hairline)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>Tele-MANAS (India)</span>
                  <Phone size={13} style={{ color: 'var(--status-vital)' }} />
                </div>
                <div className="text-numeral" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--status-vital)', margin: '4px 0' }}>
                  14416
                </div>
                <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>Govt. of India 24/7 Mental Health Helpline</div>
              </div>

              {/* Vandrevala Foundation */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-veil)',
                  border: '1px solid var(--hairline)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>Vandrevala Foundation</span>
                  <Phone size={13} style={{ color: 'var(--status-vital)' }} />
                </div>
                <div className="text-numeral" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--status-vital)', margin: '4px 0' }}>
                  +91 9999 666 555
                </div>
                <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>24/7 Free Crisis Counseling</div>
              </div>
            </div>
          </div>

          {/* Medical Legal Disclaimer Notice */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--hairline)',
              fontSize: '11px',
              color: 'var(--theme-text-muted)',
              lineHeight: 1.5,
            }}
          >
            <strong>Important Safety Notice:</strong> MAITRI is an AI wellness companion for reflective mindfulness and posture guidance. It is not an emergency crisis intervention service, a licensed medical device, or a substitute for professional clinical care.
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-veil)' }}>
          <button className="btn btn-secondary" onClick={() => openSos(false)}>
            Close Support Protocol
          </button>
        </div>
      </div>
    </div>
  );
};
