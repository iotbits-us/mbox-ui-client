// Internal Constants and Utils
import { ManifestLoadError, WebSocketOpenError } from "./errors";
import {
  ErrorMessage,
  FactoryResetMessage,
  InfoMessage,
  StatusMessage,
  LocateMessage,
  Password,
  RebootMessage,
  ReloadMessage,
  ConfigListMessage,
  ConfigSetMessage,
  SlaveAddMessage,
  SlaveExecMessage,
  SlaveListMessage,
  SlaveRemoveMessage,
  WiFiScanStartMessage,
  WiFiScanCompleteMessage,
} from "./models";

import * as Utils from "./utils";
import { ExecOptions, DeviceInfo, DeviceStatus, DeviceConfig, Manifest, WiFiNetwork } from "$types";
import { MANIFEST_FILENAME, REQUEST_TIMEOUT } from "./utils/constants";

// Internal Components
import { WebSocketClient } from "./WebSocketClient";

interface IRecord {
  [key: string]: any;
}

class MBoxClient {
  private slavesUpdated = false;
  public slaves: IRecord[] = [];
  public manifest: Manifest | null = null;
  private webSocketClient: WebSocketClient;
  private initializedCallbacks: Array<() => void> = [];
  private statusUpdateListener: ((status: DeviceStatus) => void) | null = null;
  private deviceErrorListener: ((error: {error_code: number}) => void) | null = null;
  private wifiScanCompleteListener: (({networks}: {networks: WiFiNetwork[]}) => void) | null = null;

  constructor(private host: string) {
    this.webSocketClient = new WebSocketClient(host);
  }

  private notifyInitialized(): void {
    for (const cb of this.initializedCallbacks) {
      cb();
    }
  }

  private handleError(error: Error): void {
    let errorType = "Initialization failed:";

    if (error instanceof ManifestLoadError) {
      errorType = "Manifest loading failed:";
    } else if (error instanceof WebSocketOpenError) {
      errorType = "WebSocket opening failed:";
    }

    console.error(errorType, error);
  }

  private initializeEventHandlers(): void {
    this.webSocketClient.on(SlaveListMessage, this.handleSlaveListUpdate.bind(this));
  }

  private async handleSlaveListUpdate(data: Record<string, any>): Promise<void> {
    if (!data.slaves) return;

    const updatedSlaves = this.processSlaves(data.slaves);
    this.slaves = updatedSlaves;
    this.slavesUpdated = true;
  }

  private processSlaves(slavesData: Record<string, any>[]): Record<string, any>[] {
    return slavesData
      .map((slave) => {
        const foundSlaveManifest = this.manifest?.slaves.find(
          (slvManifest: Record<string, any>) => slvManifest.id === slave.manifest_id
        );

        if (!foundSlaveManifest) return;

        return this.updateSlaveRegisters(slave, foundSlaveManifest);
      })
      .filter(Boolean) as Record<string, any>[];
  }

  private updateSlaveRegisters(
    slave: Record<string, any>,
    foundSlaveManifest: Record<string, any>
  ): Record<string, any> {
    const updatedSlave = { ...slave, ...foundSlaveManifest };
    return updatedSlave;
  }

  private async loadManifest(): Promise<Manifest> {
    try {
      const response = await fetch(`http://${this.host}/${MANIFEST_FILENAME}`);
      if (!response.ok) throw new ManifestLoadError(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      throw new ManifestLoadError(`Failed to load manifest: ${error}`);
    }
  }

  private async request<T>(message: any): Promise<T> {
    return Utils.promisifyWithTimeout(
      new Promise<T>((resolve, reject) => {
        this.webSocketClient.send(message).then(() => {
          this.webSocketClient.once(message, resolve);
        }, reject);
      })
    );
  }

  public async init(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.manifest = await this.loadManifest();
        await this.webSocketClient.open();
        this.initializeEventHandlers();
        this.notifyInitialized();
        resolve();
      } catch (error) {
        if (error instanceof Error) {
          this.handleError(error);
        }
        reject(error);
      }
    });
  }

  /**
   * Flash the locate LED.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  public locate(): Promise<void> {
    const message = new LocateMessage();
    return this.request<void>(message);
  }

  public getInfo(): Promise<DeviceInfo> {
    let message = new InfoMessage();
    return this.request<DeviceInfo>(message);
  }

  public getStatus(): Promise<DeviceStatus> {
    let message = new StatusMessage();
    return this.request<DeviceStatus>(message);
  }

  public wifiScan(): Promise<void> {
    let message = new WiFiScanStartMessage();
    return this.request<any>(message);
  }

  public setWiFi(network: any): Promise<void> {
    let message = new ConfigSetMessage(network);
    return this.request<void>(message);
  }

  public getConfig(): Promise<DeviceConfig> {
    let message = new ConfigListMessage();
    return this.request<DeviceConfig>(message);
  }

  public setConfig(data: DeviceConfig): Promise<DeviceConfig> {
    let message = new ConfigSetMessage(data);
    return this.request<DeviceConfig>(message);
  }

  public getSlave(slaveId?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let message = new SlaveListMessage();

      this.webSocketClient.send(message).then(
        () => {
          this.webSocketClient.once(message, (data: any) => {
            if (!data.slaves) {
              reject();
            }

            let slaves = structuredClone(data.slaves);

            slaves.forEach((slave: any) => {
              let manifest = structuredClone(this.manifest);

              let tempReg16 = slave.regs16 ? [...slave.regs16] : [];
              let tempReg32 = slave.regs32 ? [...slave.regs32] : [];

              let foundSlaveManifest = manifest?.slaves.find((slvManifest: any) => {
                return slvManifest.id === slave.manifest_id;
              });

              if (!foundSlaveManifest) {
                reject();
              }

              slave.regs16 = foundSlaveManifest?.regs16 ? [...foundSlaveManifest.regs16] : [];
              slave.regs32 = foundSlaveManifest?.regs32 ? [...foundSlaveManifest.regs32] : [];
              slave.functions = foundSlaveManifest?.functions ? [...foundSlaveManifest.functions] : [];
              slave.device_manufacturer = foundSlaveManifest?.device_manufacturer;
              slave.device_model = foundSlaveManifest?.device_model;

              slave.regs16.forEach((register: any) => {
                let found = tempReg16.find((element: any) => {
                  return element.address === register.address;
                });
                if (found) {
                  register.enabled = true;
                  register.lastRead = found.lastRead;
                  register.readTime = found.readTime ? found.readTime : 0;
                  register.hasFailed = found.hasFailed ? found.hasFailed : false;
                } else {
                  register.enabled = false;
                }
              });

              slave.regs32.forEach((register: any) => {
                let found = tempReg32.find((element: any) => {
                  return element.address === register.address;
                });
                if (found) {
                  register.enabled = true;
                  register.lastRead = found.lastRead;
                  register.readTime = found.readTime ? found.readTime : 0;
                  register.hasFailed = found.hasFailed ? found.hasFailed : false;
                } else {
                  register.enabled = false;
                }
              });
            });

            if (slaveId === undefined) {
              this.slaves = slaves;
              resolve(slaves);
            }

            let selectedSlave = slaves.find(function (element: any) {
              return element.id === slaveId;
            });

            let found: any[] = [];

            if (selectedSlave) {
              found.push(selectedSlave);
            }

            resolve(found);
          });
        },
        () => {
          reject();
        }
      );

      // Set timeout
      setTimeout(function () {
        reject();
      }, REQUEST_TIMEOUT);
    });
  }

  public addSlave(slave: any): Promise<void> {
    let message = new SlaveAddMessage(slave);
    return this.request<void>(message);
  }

  public removeSlave(id: number): Promise<void> {
    let message = new SlaveRemoveMessage({ id: id });
    return this.request<void>(message);
  }

  /**
   * Changes the password.
   * @param {Utils.Password} newPassword The new password.
   * @returns {Promise<void>}
   */
  public changePassword(newPassword: Password): Promise<void> {
    let message = new ConfigSetMessage({ admin_pass: newPassword.password });
    return this.request<void>(message);
  }

  /**
   * Reloads the device.
   * @returns {Promise<void>}
   */
  public reload(): Promise<void> {
    let message = new ReloadMessage();
    return this.request<void>(message);
  }

  /**
   * Reboots the device.
   * @returns {Promise<void>}
   */
  public reboot(): Promise<void> {
    let message = new RebootMessage();
    return this.request<void>(message);
  }

  /**
   * Resets the device to factory config.
   * @returns {Promise<void>}
   */
  public factoryReset(): Promise<void> {
    let message = new FactoryResetMessage();
    return this.request<void>(message);
  }

  /**
   * Subscribes a callback function to be executed when the client is initialized.
   *
   * @param {() => void} cb - The callback function to execute upon initialization.
   */
  public onInitialized(cb: () => void): void {
    this.initializedCallbacks.push(cb);
  }

  /**
   * Executes a function on a slave device.
   * @param {number} slaveId The ID of the slave device.
   * @param {ExecOptions} options The execution options.
   * @returns {Promise<void>}
   */
  public slaveExec(slaveId: number, options: ExecOptions): Promise<void> {
    let message = new SlaveExecMessage();

    message.data = {
      id: slaveId,
      f_name: options.funcName,
      opt_name: options.optionName,
      value: options.value ? options.value : 0,
    };

    return this.request<void>(message);
  }

  /**
   * Subscribes to status updates.
   * @param {(status: DeviceStatus) => void} cb Callback function to execute when a status update is received.
   */
  public onStatusUpdate(cb: (status: DeviceStatus) => void) {
    // Save a reference to the listener function
    this.statusUpdateListener = (status: DeviceStatus) => {
      cb(status);
    };

    return this.webSocketClient.on(StatusMessage, this.statusUpdateListener);
  }

  /**
   * Unsubscribes from status updates.
   */
  public offStatusUpdate() {
    if (this.statusUpdateListener) {
      this.webSocketClient.off(StatusMessage, this.statusUpdateListener);
    }
  }

  /**
   * Subscribes to device error messages.
   * @param {(error: Error) => void} cb Callback function to execute when an error message is received.
   */
  public onDeviceError(cb: (error: {error_code: number}) => void) {
    // Save a reference to the listener function
    this.deviceErrorListener = (error: {error_code: number}) => {
      cb(error);
    };

    return this.webSocketClient.on(ErrorMessage, this.deviceErrorListener);
  }

  /**
   * Unsubscribes from device error messages.
   */
  public offDeviceError() {
    if (this.deviceErrorListener) {
      this.webSocketClient.off(ErrorMessage, this.deviceErrorListener);
    }
  }

  /**
   * Subscribes to updates to the list of slave devices.
   * @param {Function} cb Callback function to execute when the list of slave devices is updated.
   */
  public onSlavesUpdate(cb: Function) {
    this.webSocketClient.on(SlaveListMessage, (_slaves: any) => {
      if (this.slavesUpdated) {
        cb(this.slaves);
      }
    });
  }

  /**
   * Subscribes to status updates.
   * @param {(networks: WiFiNetwork[]) => void} cb Callback function to execute when Wi-Fi scan completed.
   */
  public onWiFiScanComplete(cb: (networks: WiFiNetwork[]) => void) {
    // Save a reference to the listener function
    this.wifiScanCompleteListener = ({networks}: {networks: WiFiNetwork[]}) => {
      cb(networks);
    };

    return this.webSocketClient.on(WiFiScanCompleteMessage, this.wifiScanCompleteListener);
  }

  /**
   * Unsubscribes from WiFi Scan Complete.
   */
  public offWiFiScanComplete() {
    if (this.wifiScanCompleteListener) {
      this.webSocketClient.off(WiFiScanCompleteMessage, this.wifiScanCompleteListener);
    }
  }
}

export { MBoxClient };

export type {
  ErrorMessage,
  FactoryResetMessage,
  InfoMessage,
  StatusMessage,
  LocateMessage,
  Message,
  RebootMessage,
  ReloadMessage,
  ConfigListMessage,
  ConfigSetMessage,
  SlaveAddMessage,
  SlaveExecMessage,
  SlaveListMessage,
  SlaveRemoveMessage,
  WiFiScanStartMessage,
  WiFiScanCompleteMessage,
} from "./models";

export type { DeviceInfo, DeviceStatus, Manifest, DeviceConfig, ExecOptions, WiFiNetwork } from "./types";
