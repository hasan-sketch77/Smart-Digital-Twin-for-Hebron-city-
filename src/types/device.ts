export interface IoTDeviceData {
  id: string;
  nameAr: string;
  type: DeviceType;
  status: DeviceStatus;
  coordinates: [number, number];
  dataType: string;
  batteryLevel: number | null;
  lastReading: string | null;
  lastReadingAt: string | null;
  installDate: string;
  maintenanceDue: string | null;
  firmwareVersion: string | null;
}

export type DeviceType = "traffic_sensor" | "air_quality" | "noise" | "camera" | "weather" | "lighting";
export type DeviceStatus = "active" | "warning" | "offline" | "maintenance";
