import * as Models from "./models";

import { promisifyWithTimeout } from "./utils";

import { WebSocketClient } from "./WebSocketClient";

import { ManifestLoadError, WebSocketOpenError } from "./errors";

import { MANIFEST_FILENAME, REQUEST_TIMEOUT } from "./constants";

import {
  DeviceInfo,
  DeviceStatus,
  DeviceConfig,
  WiFiNetwork,
  SlaveEnriched,
  Manifest,
  Slave,
  SlaveFromManifest,
  FunctionOptionCommand,
  SlaveFunctionOption,
  SlaveFunction,
  SlaveCreate,
} from "$types";

class MBoxClient {
  private slavesUpdated = false;
  private enrichedSlaves: SlaveEnriched[] = [];
  private webSocketClient: WebSocketClient;
  private initializedCallbacks: Array<() => void> = [];
  private statusUpdateListener: ((status: DeviceStatus) => void) | null = null;
  private deviceErrorListener: ((error: { error_code: number }) => void) | null = null;
  private wifiScanCompleteListener: (({ networks }: { networks: WiFiNetwork[] }) => void) | null = null;

  public manifest: Manifest | null = null;

  constructor(private host: string) {
    this.webSocketClient = new WebSocketClient(host);
  }

  private async request<T>(message: any): Promise<T> {
    return promisifyWithTimeout(
      new Promise<T>((resolve, reject) => {
        this.webSocketClient.send(message).then(() => {
          this.webSocketClient.once(message, resolve);
        }, reject);
      })
    );
  }

  private async handleSlaveListUpdate(data: Record<string, any>): Promise<void> {
    if (!data.slaves) return;

    const slaves: Slave[] = data.slaves;

    const enrichedSlaves: SlaveEnriched[] = slaves.map((slave: Slave) => {
      return this.enrichSlave(slave);
    });

    this.enrichedSlaves = enrichedSlaves;

    this.slavesUpdated = true;
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

  private enrichSlave(slave: Slave): SlaveEnriched {
    if (!this.manifest) {
      throw new Error("Manifest is not available.");
    }

    const foundSlaveFromManifest = this.manifest.slaves.find(
      (slaveFromManifest: SlaveFromManifest) => slaveFromManifest.id === slave.manifest_id
    );

    if (!foundSlaveFromManifest) {
      throw new Error(`Slave with manifest ID ${slave.manifest_id} not found.`);
    }

    const enrichedSlave: SlaveEnriched = {
      id: slave.id || 1,
      type: slave.type,
      address: slave.address,
      manifest_id: slave.manifest_id,
      name: slave.name,
      enabled: slave.enabled,
      baud_rate: slave.baud_rate,
      remote_ctrl_enabled: slave.remote_ctrl_enabled,
      remote_spdctrl_enabled: slave.remote_spdctrl_enabled,
        // Process regs16
    regs16: foundSlaveFromManifest.regs16.map(reg => {
      const slaveReg = slave.regs16.find(slaveReg => slaveReg.address === reg.address);
      return {
        ...reg,
        enabled: !!slaveReg,
        lastRead: slaveReg?.lastRead ?? reg.lastRead,
        readTime: slaveReg?.readTime ?? reg.readTime,
        hasFailed: slaveReg?.hasFailed ?? reg.hasFailed
      };
    }),
    // Process regs32
    regs32: foundSlaveFromManifest.regs32.map(reg => {
      const slaveReg = slave.regs32.find(slaveReg => slaveReg.address === reg.address);
      return {
        ...reg,
        enabled: !!slaveReg,
        lastRead: slaveReg?.lastRead ?? reg.lastRead,
        readTime: slaveReg?.readTime ?? reg.readTime,
        hasFailed: slaveReg?.hasFailed ?? reg.hasFailed
      };
    }),
      functions: foundSlaveFromManifest.functions.map((fun: SlaveFunction) => ({
        ...fun,
        options: fun.options.map((opt: SlaveFunctionOption) => ({
          ...opt,
          command: { functionName: fun.name, optionName: opt.name, value: opt.val },
        })),
      })),
    };

    return enrichedSlave;
  }

  private notifyInitialized(): void {
    for (const cb of this.initializedCallbacks) {
      cb();
    }
  }

  private initializeEventHandlers(): void {
    this.webSocketClient.on(Models.SlaveListMessage, this.handleSlaveListUpdate.bind(this));
  }

  private waitForSlaveListResponse(): Promise<any> {
    return new Promise((resolve, reject) => {
      const message = new Models.SlaveListMessage();

      // Timeout function to reject the promise after a specified time
      const timeoutId = setTimeout(() => {
        this.webSocketClient.off(message, onResponse);
        reject(new Error("Request timeout"));
      }, REQUEST_TIMEOUT);

      const onResponse = (response: any) => {
        clearTimeout(timeoutId);
        resolve(response);
      };

      this.webSocketClient.once(message, onResponse);
    });
  }

  private enrichReceivedSlaves(slaves: Slave[]): SlaveEnriched[] {
    if (!slaves) {
      throw new Error("No slaves data received");
    }

    return slaves.map((slave: Slave) => this.enrichSlave(slave)).filter(Boolean) as SlaveEnriched[];
  }

  private findSlaveById(slaves: SlaveEnriched[], slaveId: number): SlaveEnriched | null {
    return slaves.find((slave) => slave.id === slaveId) || null;
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

  /* PUBLIC API */

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
    const message = new Models.LocateMessage();
    return this.request<void>(message);
  }

  public getInfo(): Promise<DeviceInfo> {
    let message = new Models.InfoMessage();
    return this.request<DeviceInfo>(message);
  }

  public getStatus(): Promise<DeviceStatus> {
    let message = new Models.StatusMessage();
    return this.request<DeviceStatus>(message);
  }

  public wifiScan(): Promise<void> {
    let message = new Models.WiFiScanStartMessage();
    return this.request<any>(message);
  }

  public setWiFi(network: any): Promise<void> {
    let message = new Models.ConfigSetMessage(network);
    return this.request<void>(message);
  }

  public getConfig(): Promise<DeviceConfig> {
    let message = new Models.ConfigListMessage();
    return this.request<DeviceConfig>(message);
  }

  public setConfig(data: DeviceConfig): Promise<DeviceConfig> {
    let message = new Models.ConfigSetMessage(data);
    return this.request<DeviceConfig>(message);
  }

  public async getSlave(slaveId: number): Promise<SlaveEnriched | null> {
    try {
      // Request slave list from device
      const message = new Models.SlaveListMessage();
      await this.webSocketClient.send(message);
      // Wait for response
      const data = await this.waitForSlaveListResponse();
      // Process received slaves and enrich them with manifest
      const enrichedSlaves: SlaveEnriched[] = this.enrichReceivedSlaves(data.slaves);
      // Find slave by id
      return this.findSlaveById(enrichedSlaves, slaveId);
    } catch (error) {
      return Promise.reject("An error occurred while getting the slave");
    }
  }

  public async getSlaves(): Promise<SlaveEnriched[] | []> {
    try {
      // Request "Slave List" from device
      const message = new Models.SlaveListMessage();
      await this.webSocketClient.send(message);
      // Wait for "Slave List"
      const data = await this.waitForSlaveListResponse();
      // Process received slaves and enrich them with manifest
      return this.enrichReceivedSlaves(data.slaves);
    } catch (error) {
      return Promise.reject("An error occurred while getting slaves");
    }
  }

  public addSlave(slave: SlaveCreate): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let message = new Models.SlaveAddMessage(slave);

      // Temporary function to handle device errors
      const tempErrorHandler = (error: { error_code: number }) => {
        if (error.error_code === 204) {
          // Unsubscribe from the error event once handled
          this.webSocketClient.off(Models.ErrorMessage, tempErrorHandler);
          reject(new Error("Maximum number of slaves reached"));
        }
      };

      // Subscribe to device error messages temporarily
      this.webSocketClient.on(Models.ErrorMessage, tempErrorHandler);

      // Make the request
      this.request<void>(message)
        .then(() => {
          // Unsubscribe from the error event once the request is successful
          this.webSocketClient.off(Models.ErrorMessage, tempErrorHandler);
          resolve();
        })
        .catch(reject);
    });
  }

  public removeSlave(id: number): Promise<void> {
    let message = new Models.SlaveRemoveMessage({ id: id });
    return this.request<void>(message);
  }

  public changePassword(newPassword: Models.Password): Promise<void> {
    let message = new Models.ConfigSetMessage({ admin_pass: newPassword.password });
    return this.request<void>(message);
  }

  /**
   * Reloads the device.
   * @returns {Promise<void>}
   */
  public reload(): Promise<void> {
    let message = new Models.ReloadMessage();
    return this.request<void>(message);
  }

  /**
   * Reboots the device.
   * @returns {Promise<void>}
   */
  public reboot(): Promise<void> {
    let message = new Models.RebootMessage();
    return this.request<void>(message);
  }

  /**
   * Resets the device to factory config.
   * @returns {Promise<void>}
   */
  public factoryReset(): Promise<void> {
    let message = new Models.FactoryResetMessage();
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

  public runSlaveFunction(slaveId: number, command: FunctionOptionCommand): Promise<void> {
    let message = new Models.SlaveExecMessage();

    message.data = {
      id: slaveId,
      f_name: command.functionName,
      opt_name: command.optionName,
      value: command.value ? command.value : 0,
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

    return this.webSocketClient.on(Models.StatusMessage, this.statusUpdateListener);
  }

  /**
   * Unsubscribes from status updates.
   */
  public offStatusUpdate() {
    if (this.statusUpdateListener) {
      this.webSocketClient.off(Models.StatusMessage, this.statusUpdateListener);
    }
  }

  /**
   * Subscribes to device error messages.
   * @param {(error: Error) => void} cb Callback function to execute when an error message is received.
   */
  public onDeviceError(cb: (error: { error_code: number }) => void) {
    // Save a reference to the listener function
    this.deviceErrorListener = (error: { error_code: number }) => {
      cb(error);
    };

    return this.webSocketClient.on(Models.ErrorMessage, this.deviceErrorListener);
  }

  /**
   * Unsubscribes from device error messages.
   */
  public offDeviceError() {
    if (this.deviceErrorListener) {
      this.webSocketClient.off(Models.ErrorMessage, this.deviceErrorListener);
    }
  }

  /**
   * Subscribes to updates to the list of slave devices.
   * @param {Function} cb Callback function to execute when the list of slave devices is updated.
   */
  public onSlavesUpdate(cb: Function) {
    this.webSocketClient.on(Models.SlaveListMessage, (_slaves: any) => {
      if (this.slavesUpdated) {
        cb(this.enrichedSlaves);
      }
    });
  }

  /**
   * Subscribes to status updates.
   * @param {(networks: WiFiNetwork[]) => void} cb Callback function to execute when Wi-Fi scan completed.
   */
  public onWiFiScanComplete(cb: (networks: WiFiNetwork[]) => void) {
    // Save a reference to the listener function
    this.wifiScanCompleteListener = ({ networks }: { networks: WiFiNetwork[] }) => {
      cb(networks);
    };

    return this.webSocketClient.on(Models.WiFiScanCompleteMessage, this.wifiScanCompleteListener);
  }

  /**
   * Unsubscribes from WiFi Scan Complete.
   */
  public offWiFiScanComplete() {
    if (this.wifiScanCompleteListener) {
      this.webSocketClient.off(Models.WiFiScanCompleteMessage, this.wifiScanCompleteListener);
    }
  }
}

export type * from "./models";

export type * from "./types";

export { MBoxClient };
