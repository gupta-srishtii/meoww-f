import { IHealthService } from '../contracts';
import { TelemetryReading, HardwareDevice } from '../../types/health';

const DEVICES_KEY = 'maitri_mock_devices';

const DEFAULT_DEVICES: HardwareDevice[] = [
  {
    id: 'dev_esp8266_01',
    label: 'Desk AD8232 ECG + DHT11 Sensor',
    deviceKeyPrefix: 'dtk_7a8f9c...',
    type: 'ESP8266_AD8232',
    status: 'online',
    lastSeenAt: 'Just now',
  },
  {
    id: 'dev_ble_02',
    label: 'Polar H10 Heart Rate Strap',
    deviceKeyPrefix: 'ble_polar_...',
    type: 'BLE_HEART_RATE',
    status: 'offline',
    lastSeenAt: '2 hours ago',
  },
];

export class MockHealthService implements IHealthService {
  async getHistory(days:number):Promise<TelemetryReading[]> {
    return Array.from({length:Math.min(30,Math.max(1,days))},(_,i)=>{
      const date=new Date();date.setDate(date.getDate()-(days-1-i));date.setHours(12,0,0,0);
      return {heartRate:Math.round(72+Math.sin(i*.8)*6),hrv:Math.round(52+Math.cos(i*.5)*7),stressScore:Math.round(28+Math.sin(i*.4)*9),spo2:98,temperatureC:24.4,humidityPct:52,leadsOff:false,source:'simulated',timestamp:date.toISOString()};
    });
  }
  async getLatestTelemetry(): Promise<TelemetryReading> {
    // Generate realistic fluctuating biometrics
    const baseHR = 72;
    const hr = Math.round(baseHR + (Math.sin(Date.now() / 3000) * 5) + (Math.random() * 2));
    const hrv = Math.round(52 + (Math.cos(Date.now() / 4500) * 6));
    const stress = Math.round(28 + (Math.sin(Date.now() / 6000) * 8));

    return {
      heartRate: hr,
      hrv,
      stressScore: stress,
      spo2: 98,
      temperatureC: 24.4,
      humidityPct: 52,
      leadsOff: false,
      source: 'simulated',
      timestamp: new Date().toISOString(),
    };
  }

  async getDevices(): Promise<HardwareDevice[]> {
    const raw = localStorage.getItem(DEVICES_KEY);
    if (!raw) {
      localStorage.setItem(DEVICES_KEY, JSON.stringify(DEFAULT_DEVICES));
      return DEFAULT_DEVICES;
    }
    return JSON.parse(raw);
  }

  async pairDevice(label: string): Promise<HardwareDevice> {
    const devices = await this.getDevices();
    const newDevice: HardwareDevice = {
      id: 'dev_' + Date.now(),
      label: label || 'New Biosensor Link',
      deviceKeyPrefix: 'dtk_' + Math.random().toString(36).substring(2, 8) + '...',
      type: 'ESP8266_AD8232',
      status: 'online',
      lastSeenAt: 'Just now',
    };
    devices.push(newDevice);
    localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
    return newDevice;
  }
}
