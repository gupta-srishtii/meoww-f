import {useDialog} from '../common/useDialog';
import React from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle } from 'lucide-react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useAuthStore } from '../../store/useAuthStore';

export const AiDisclaimerModal: React.FC = () => {
  const { isDisclaimerOpen, openDisclaimer } = useNavigationStore();
  const { acceptDisclaimer } = useAuthStore();

  const dialog=useDialog(isDisclaimerOpen,()=>openDisclaimer(false));
  if (!isDisclaimerOpen) return null;

  const handleAgree = () => {
    acceptDisclaimer();
    openDisclaimer(false);
  };

  return (
    <div className="modal-backdrop">
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="AI safety and privacy" className="modal-dialog" style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--hairline)',
            background: 'var(--surface-veil)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid var(--status-vital)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-vital)',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>AI Companion Safety & Privacy Charter</h3>
            <p style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
              Read before entering the MAITRI workspace
            </p>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', lineHeight: 1.6 }}>
          {/* Pillar 1 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Lock size={18} style={{ color: 'var(--companion-gold)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--theme-text-main)' }}>1. Local demo and browser permissions</div>
              <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                Chat replies, health readings and social features are local simulations. Camera preview starts only after you request it. Browser speech recognition may use a remote browser-provider service; review your browser privacy settings. No facial emotion or posture inference is running.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--status-caution)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--theme-text-main)' }}>2. Wellness Companion, Not Clinical Diagnosis</div>
              <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                MAITRI is designed to cultivate somatic awareness, breathing stability, and mindful desk posture. It is not an FDA/CDSCO-licensed medical diagnostic instrument or a substitute for psychiatric treatment.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Eye size={18} style={{ color: 'var(--theme-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--theme-text-main)' }}>3. Truth in Telemetry & Safety</div>
              <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                Simulated data is always explicitly marked as simulated. If at any time you disclose acute distress, MAITRI will prioritize immediate human helplines and calm grounding.
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-veil)' }}>
          <button className="btn btn-primary" onClick={handleAgree}>
            I Understand & Enter Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
