export type WebSocketClientConfig = {
  authenticationTimeout: number;
  connectionTimeout: number;
  requestTimeout: number;
};

export type DeviceConfig = {
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
};

export type InfoTopics = {
  host: string;
};

export type DeviceInfo = {
  hostname?: string;
  acps_triggered?: boolean;
  app_name?: string;
  app_version?: string;
  app_build?: string;
  manufacturer?: string;
  chip_id?: string;
  mac?: string;
  sdk?: string;
  mqtt_data_mode?: number;
  slave_count?: number;
  max_slv_allowed?: number;
  manifest_ready?: boolean;
  manifest_version?: string;
  manifest_size?: number;
  manifest_slaves_count?: number;
  modbus_polling_enabled?: boolean;
  modbus_polling_interval?: number;
  topics?: InfoTopics;
};

export type DeviceStatus = {
  change_pass?: boolean;
  free_heap?: number;
  used_heap?: number;
  uptime?: number;
  load_average?: number;
  wifi_connected?: boolean;
  mqtt_status?: number;
  polling_cycle?: boolean;
  input_voltage?: string;
  ssid?: string;
  ip?: string;
  bssid?: string;
  channel?: number;
  rssi?: number;
  signal_quality?: number;
  last_cycle_duration?: number;
  pending_reboot?: boolean;
};

export type WiFiNetwork = {
  ssid: string;
  rssi: number;
  security: number;
  bssid: string;
  channel: number;
  quality: number;
  encryption: string;
};

export type { Manifest } from "./manifest";

export type { Slave, FunCommand, SlaveFunction } from "./slave";
