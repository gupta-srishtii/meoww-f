export interface TelemetryReading {
  heartRate: number;        // bpm
  hrv: number;              // ms (SDNN)
  stressScore: number;      // 0-100
  spo2: number;             // % (simulated/indicated)
  temperatureC?: number;    // DHT11 sensor
  humidityPct?: number;     // DHT11 sensor
  leadsOff: boolean;
  source: 'simulated' | 'bluetooth' | 'esp8266';
  timestamp: string;
}

export interface HardwareDevice {
  id: string;
  label: string;
  deviceKeyPrefix: string;
  type: 'ESP8266_AD8232' | 'BLE_HEART_RATE';
  status: 'online' | 'offline' | 'pairing';
  lastSeenAt: string;
}
