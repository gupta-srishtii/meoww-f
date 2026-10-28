import {useThemeStore} from '../../store/useThemeStore';
import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, Activity, Cpu, Bluetooth, Wifi, ShieldAlert, Sparkles, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { TelemetryNumber } from '../../components/common/TelemetryNumber';
import { services } from '../../services';
import { TelemetryReading, HardwareDevice } from '../../types/health';

export const HealthView: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryReading | null>(null);
  const [devices, setDevices] = useState<HardwareDevice[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'ecg' | 'hardware'>('overview');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [pairingSuccess, setPairingSuccess] = useState<string | null>(null);
  const [notice,setNotice]=useState('');const [pairing,setPairing]=useState(false);const pairPending=useRef(false);
  const theme=useThemeStore();
  const [history,setHistory]=useState<TelemetryReading[]>([]),[days,setDays]=useState(7),[metric,setMetric]=useState<'heartRate'|'hrv'|'stressScore'>('heartRate'),[sample,setSample]=useState(0),[paused,setPaused]=useState(false);
  useEffect(()=>{services.health.getHistory(days).then(data=>{setHistory(data);setSample(data.length-1);}).catch(()=>setNotice('Could not load the sample history. Please try another range.'));},[days]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    services.health.getLatestTelemetry().then(setTelemetry).catch(()=>setNotice('Sample telemetry is unavailable.'));
    services.health.getDevices().then(setDevices).catch(()=>setNotice('Could not load the local device list. Check browser storage and try again.'));

    const interval = setInterval(() => {
      services.health.getLatestTelemetry().then(setTelemetry).catch(()=>setNotice('Sample telemetry is unavailable.'));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Rolling Real-Time ECG Oscilloscope Canvas (AD8232 Simulation)
  useEffect(() => {
    if(activeTab!=='ecg')return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let step = 0;
    const bufferSize = canvas.width;
    const points: number[] = Array.from({length:bufferSize},(_,i)=>canvas.height/2+(i%65===28?-55:i%65===32?25:Math.sin(i*.2)*3));

    const render = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--theme-panel-bg');
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint grid
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--hairline');
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Generate ECG QRS spike every ~60 frames
      step = (step + 1) % 65;
      let val = canvas.height / 2;
      if (step === 20) val -= 15; // P wave
      else if (step === 25) val += 10; // Q wave
      else if (step === 28) val -= 55; // R peak
      else if (step === 32) val += 25; // S wave
      else if (step === 42) val -= 18; // T wave
      else val += (Math.random() - 0.5) * 4; // Sensor noise

      points.shift();
      points.push(val);

      // Draw ECG trace
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--status-vital');
      ctx.lineWidth = 2;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(i, points[i]);
        else ctx.lineTo(i, points[i]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if(!paused&&theme.motion!=='none'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [activeTab,paused,theme.motion,theme.theme,theme.accent]);

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()||pairPending.current) return;
    pairPending.current=true;setPairing(true);setPairingSuccess(null);setNotice('');
    try{const device = await services.health.pairDevice(newDeviceName.trim());
    setDevices((prev) => [...prev, device]);
    setPairingSuccess(`Demo link saved. Sample key prefix: ${device.deviceKeyPrefix}`);
    setNewDeviceName('');
    }catch{setNotice('Could not save this demo device. Your label is still here; check browser storage and try again.');}finally{pairPending.current=false;setPairing(false);}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-vital)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              YOUR HEALTH OBSERVATORY
            </span>
            <span className="badge-demo">Demonstration Grade</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>Health & Telemetry</h1>
          <p style={{ fontSize: '13px', color: 'var(--theme-text-muted)' }}>
            Explore simulated trends and a sample ECG. No medical measurements or physical devices are connected.
          </p>
        </div>

        {/* Tab pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setActiveTab('overview')}
          >
            Telemetry Overview
          </button>
          <button
            className={`btn ${activeTab === 'ecg' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setActiveTab('ecg')}
          >
            Live ECG Waveform
          </button>
          <button
            className={`btn ${activeTab === 'hardware' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setActiveTab('hardware')}
          >
            Hardware Link
          </button>
        </div>
      </div>

      {/* Main Biometric Numbers Grid (Monospace Numeral Rule) */}
      <p className="feature-notice" role="status">{notice}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
        <GlassCard>
          <TelemetryNumber
            label="Heart Rate"
            value={telemetry?.heartRate || 72}
            unit="BPM"
            status="vital"
            size="lg"
          />
          <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginTop: '8px' }}>
            Generated demo value
          </div>
        </GlassCard>

        <GlassCard>
          <TelemetryNumber
            label="HRV (SDNN)"
            value={telemetry?.hrv || 54}
            unit="ms"
            status="vital"
            size="lg"
          />
          <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginTop: '8px' }}>
            Vagal tone & adaptability
          </div>
        </GlassCard>

        <GlassCard>
          <TelemetryNumber
            label="Stress Index"
            value={telemetry?.stressScore || 26}
            unit="/100"
            status="neutral"
            size="lg"
          />
          <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginTop: '8px' }}>
            Simulated interface score
          </div>
        </GlassCard>

        <GlassCard>
          <TelemetryNumber
            label="SpO2 Oxygen"
            value={telemetry?.spo2 || 98}
            unit="%"
            status="neutral"
            size="lg"
          />
          <div style={{ fontSize: '11px', color: 'var(--companion-gold-soft)', marginTop: '8px' }}>
            Simulated / Indicated
          </div>
        </GlassCard>

        <GlassCard>
          <TelemetryNumber
            label="Ambient Temp"
            value={telemetry?.temperatureC || 24.2}
            unit="°C"
            status="neutral"
            size="lg"
          />
          <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginTop: '8px' }}>
            Sample humidity: {telemetry?.humidityPct}% RH
          </div>
        </GlassCard>
      </div>

      {activeTab==='overview'&&<>
      <section className="observatory-history"><div className="section-heading"><div><span className="eyebrow">SAMPLE HISTORY / NOT MEASUREMENTS</span><h2>A wider perspective</h2></div><div className="history-controls"><label>Metric <select value={metric} onChange={e=>setMetric(e.target.value as typeof metric)}><option value="heartRate">Heart rate</option><option value="hrv">HRV</option><option value="stressScore">Stress index</option></select></label><label>Range <select aria-label="History range" value={days} onChange={e=>setDays(Number(e.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option></select></label></div></div><svg viewBox="0 0 700 190" role="img" aria-label="Interactive simulated health trend"><polyline points={history.map((r,i)=>(20+i*660/Math.max(1,history.length-1))+','+(165-r[metric]*1.5)).join(' ')} fill="none" stroke="var(--action)" strokeWidth="2"/>{history.map((r,i)=><circle key={r.timestamp} role="button" tabIndex={0} aria-label={new Date(r.timestamp).toLocaleDateString()+': '+r[metric]} onClick={()=>setSample(i)} onFocus={()=>setSample(i)} onKeyDown={e=>{if(e.key==='Enter')setSample(i);}} cx={20+i*660/Math.max(1,history.length-1)} cy={165-r[metric]*1.5} r={sample===i?7:4} fill={sample===i?'var(--action)':'var(--theme-accent)'}><title>{new Date(r.timestamp).toLocaleDateString()}: {r[metric]}</title></circle>)}</svg><label className="sample-slider">Explore sample <input aria-label="Explore history sample" type="range" min={0} max={Math.max(0,history.length-1)} value={sample} onChange={e=>setSample(Number(e.target.value))}/></label><p role="status">{history[sample]&&new Date(history[sample].timestamp).toLocaleDateString()+' / '+history[sample][metric]+' / simulated'}</p><div className="metric-details">{[{name:'Heart rate',text:'A sample of beats per minute. The values are generated locally and cannot indicate your health.'},{name:'Heart-rate variability',text:'A sample variation between beats, shown in milliseconds. This demo cannot assess recovery or readiness.'},{name:'Stress index',text:'An illustrative interface score. It is not a validated assessment or a measurement of your emotions.'},{name:'Oxygen and environment',text:'Oxygen, temperature and humidity are sample numbers. No sensor data is being received.'}].map(m=><details key={m.name}><summary>{m.name}</summary><p>{m.text}</p></details>)}</div></section>
      </>}
      {activeTab==='ecg'&&<>
      {/* =========================================================================
          LIVE ECG OSCILLOSCOPE WAVEFORM
          ========================================================================= */}
      <GlassCard style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} style={{ color: 'var(--status-vital)' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Simulated ECG waveform</h3>
              <p style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                Locally generated sample trace. This is not a medical measurement.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="glass-pill" style={{ color: 'var(--status-vital)' }}>
              ● Simulated trace
            </span>
            <span className="glass-pill">
              Sample waveform
            </span>
          </div>
        </div>

        {/* Oscilloscope Screen */}
        <div
          style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.9)',
          }}
        >
          <button className="btn btn-secondary" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Resume simulated trace':'Pause simulated trace'}</button>
          <canvas
            aria-label="Simulated ECG waveform; no live medical data" role="img" ref={canvasRef}
            width={940}
            height={220}
            style={{ width: '100%', height: '220px', display: 'block' }}
          />
        </div>
      </GlassCard>

      </>}
      {activeTab==='hardware'&&<>
      {/* =========================================================================
          HARDWARE LINK: ESP8266 / BLE CONNECTION MANAGER
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Paired Devices List */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Paired Hardware Sensors</h3>
              <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                Local demonstration of a device list. These sample keys cannot connect to hardware.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {devices.map((dev) => (
              <div
                key={dev.id}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-veil)',
                  border: '1px solid var(--hairline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(52, 211, 153, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--status-vital)',
                    }}
                  >
                    {dev.type === 'ESP8266_AD8232' ? <Wifi size={16} /> : <Bluetooth size={16} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{dev.label}</div>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                      Key Prefix: {dev.deviceKeyPrefix} · Last seen: {dev.lastSeenAt}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: dev.status === 'online' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: dev.status === 'online' ? 'var(--status-vital)' : 'var(--theme-text-muted)',
                  }}
                >
                  {dev.status}
                </span>
              </div>
            ))}
          </div>

          {/* Pair New Device Form */}
          <form onSubmit={handlePairDevice} style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
            <input
              aria-label="Demo sensor label" maxLength={100} type="text"
              className="input-field"
              placeholder="Sensor label (e.g., Desk ESP8266 Node)"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              style={{ fontSize: '13px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={pairing||!newDeviceName.trim()} style={{ flexShrink: 0, fontSize: '12px' }}>
              <Plus size={14} />
              <span>{pairing?'Saving demo link…':'Pair Device'}</span>
            </button>
          </form>

          {pairingSuccess && (
            <div role="status" style={{ marginTop: '10px', fontSize: '12px', color: 'var(--status-vital)' }}>
              {pairingSuccess}
            </div>
          )}
        </GlassCard>

        {/* Hardware Flashing & Wiring Instructions */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Cpu size={18} style={{ color: 'var(--companion-gold-bright)' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Hardware integration preview</h4>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
            This screen previews the future hardware interface. Pairing adds a local demo entry and does not contact a device.
          </p>

          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-veil)', fontFamily: 'var(--font-numeral)', fontSize: '11px', color: 'var(--theme-text-main)', lineHeight: 1.6 }}>
            <div>ESP8266 3.3V  ──&gt;  AD8232 3.3V &amp; DHT11 VCC</div>
            <div>ESP8266 GND   ──&gt;  AD8232 GND &amp; DHT11 GND</div>
            <div>ESP8266 A0    ──&gt;  AD8232 OUTPUT</div>
            <div>ESP8266 D4    ──&gt;  DHT11 DATA</div>
            <div>Ingest Rate   ──&gt;  2 Hz HTTP POST (300 req/min)</div>
          </div>
        </GlassCard>
      </div>
      </>}
    </div>
  );
};
