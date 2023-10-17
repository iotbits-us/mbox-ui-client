export interface IRecord {
  [key: string]: any;
}

export interface IWebSocketClientConfig {
  authenticationTimeout: number;
  connectionTimeout: number;
  requestTimeout: number;
}

export interface IErrorMessage {
  error_code: string;
}

export interface ISettings {
  hostname?: string;
  wifi_ssid?: string;
  wifi_pass?: string;
  wifi_static_ip?: string;
  wifi_gateway_ip?: string;
  wifi_net_mask?: string;
  wifi_dns_ip?: string;
  mqtt_server?: string;
  mqtt_port?: number;
  mqtt_user?: string;
  mqtt_pass?: string;
  mqtt_use_token?: boolean;
  mqtt_token?: string;
  mqtt_secure?: boolean;
  mqtt_cert_file?: string;
  mqtt_retain?: boolean;
  mqtt_qos?: number;
  mqtt_data_mode?: number;
  mqtt_hsv_enabled?: boolean;
  mqtt_hsv_interval?: number;
  mqtt_alarm_enabled?: boolean;
  modbus_polling_enabled?: boolean;
  modbus_polling_interval?: number;
  admin_pass?: string;
}

interface IHostInfoTopics {
  host: string;
}

export interface IHostInfo {
  hostname: string;
  acps_triggered: boolean;
  app_name: string;
  app_version: string;
  app_build: string;
  manufacturer: string;
  chip_id: string;
  mac: string;
  sdk: string;
  mqtt_data_mode: number;
  slave_count: number;
  max_slv_allowed: number;
  manifest_ready: boolean;
  manifest_version: string;
  manifest_size: number;
  manifest_slaves_count: number;
  modbus_polling_enabled: boolean;
  modbus_polling_interval: number;
  topics: IHostInfoTopics;
}
export interface IHostStatus {
  change_pass: boolean;
  free_heap: number;
  used_heap: number;
  uptime: number;
  load_average: number;
  wifi_connected: boolean;
  mqtt_status: number;
  polling_cycle: boolean;
  input_voltage: string;
  ssid: string;
  ip: string;
  bssid: string;
  channel: number;
  rssi: number;
  signal_quality: number;
}

export interface IExecOptions {
  funcName: string;
  optionName: string;
  value?: any;
};
