import {useDialog} from '../common/useDialog';
import React, { useState } from 'react';
import { X, ShieldAlert, Cpu, Database, Activity, Mail, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { GlassCard } from '../common/GlassCard';
import { TelemetryNumber } from '../common/TelemetryNumber';

export const AdminModal: React.FC = () => {
  const { isAdminOpen, openAdmin } = useNavigationStore();
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);

  const dialog=useDialog(isAdminOpen,()=>openAdmin(false));
  if (!isAdminOpen) return null;

  const runVitalsSim = () => {
    setSandboxOutput('POST /sandbox/vitals/frame → Simulating 78 BPM, 56ms HRV, 0% Leads-Off. WebSocket stream broadcast OK.');
  };

  const runCrisisSim = () => {
    setSandboxOutput('POST /sandbox/crisis/scan → Evaluated message: "I am feeling burnt out". Calibrated Ladder v2 Result: check tier (No acute alert, inquiry prompted).');
  };

  const runSessionSeed = () => {
    setSandboxOutput('POST /sandbox/sessions/seed → Seeded 1 synthetic client + 4 verified clinical specialists across junior to specialist tiers.');
  };

  return (
    <div className="modal-backdrop" onClick={() => openAdmin(false)}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Admin demo" className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(99, 102, 241, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={20} style={{ color: '#818cf8' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--theme-text-main)' }}>
                Admin Control Center & Sandbox
              </div>
              <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                System Telemetry, Demo service health matrix & Diagnostics
              </div>
            </div>
          </div>
          <button
            className="btn-icon"
            onClick={() => openAdmin(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--theme-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Measured Process Telemetry */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--theme-text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Sample system diagnostics (simulated)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <GlassCard dense>
                <TelemetryNumber label="Heap Used" value="142" unit="MB" status="vital" size="sm" />
              </GlassCard>
              <GlassCard dense>
                <TelemetryNumber label="Heap Limit" value="2048" unit="MB" status="neutral" size="sm" />
              </GlassCard>
              <GlassCard dense>
                <TelemetryNumber label="Live WS Sockets" value="2" unit="active" status="vital" size="sm" />
              </GlassCard>
              <GlassCard dense>
                <TelemetryNumber label="Postgres Ping" value="18" unit="ms" status="vital" size="sm" />
              </GlassCard>
            </div>
          </div>

          {/* Service Health Matrix */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--theme-text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Service Health Matrix
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-veil)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} style={{ color: 'var(--status-vital)' }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>PostgreSQL 17.6 Pool</span>
                </div>
                <span className="glass-pill" style={{ color: 'var(--status-vital)', fontSize: '10px' }}>Simulated healthy</span>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-veil)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} style={{ color: 'var(--status-vital)' }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>WebSocket Gateway (/ws)</span>
                </div>
                <span className="glass-pill" style={{ color: 'var(--status-vital)', fontSize: '10px' }}>Simulated online</span>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-veil)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} style={{ color: 'var(--status-vital)' }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>Email Engine (Brevo API)</span>
                </div>
                <span className="glass-pill" style={{ color: 'var(--status-vital)', fontSize: '10px' }}>Sandbox Drop Mode</span>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-veil)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--status-vital)' }} />
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>Auth Service & SecretBox</span>
                </div>
                <span className="glass-pill" style={{ color: 'var(--status-vital)', fontSize: '10px' }}>Sample status</span>
              </div>
            </div>
          </div>

          {/* Sandbox Diagnostics Suite (Phase 0–8) */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--theme-text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Admin Tools & Sandbox Actions
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={runVitalsSim}>
                <Play size={13} />
                <span>Emit Test Vitals Frame</span>
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={runCrisisSim}>
                <AlertCircle size={13} />
                <span>Test Crisis Ladder Scan</span>
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={runSessionSeed}>
                <Database size={13} />
                <span>Seed Sandbox Sessions</span>
              </button>
            </div>

            {sandboxOutput && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(2, 6, 23, 0.85)',
                  border: '1px solid var(--hairline)',
                  fontFamily: 'var(--font-numeral)',
                  fontSize: '11px',
                  color: 'var(--status-vital)',
                  lineHeight: 1.5,
                }}
              >
                {sandboxOutput}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--hairline)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-veil)' }}>
          <button className="btn btn-secondary" onClick={() => openAdmin(false)}>
            Close Admin Console
          </button>
        </div>
      </div>
    </div>
  );
};
