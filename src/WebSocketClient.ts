import axios from "axios";
import { EventEmitter } from "./EventEmitter";
import { Message } from "./models/messages";
import { WebSocketOpenError, AuthenticationError, MessageParseError } from "./errors";
import { IWebSocketClientConfig } from "./types";

// Enum to represent WebSocket connection states
enum WebSocketState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
}

// Enum to represent WebSocket events
enum WebSocketEvents {
  CONNECTED = "endpoint-connected",
  DISCONNECTED = "endpoint-disconnected",
}

// Default configuration for the WebSocket client
const DEFAULT_CONFIG: IWebSocketClientConfig = {
  authenticationTimeout: 60000,
  connectionTimeout: 60000,
  requestTimeout: 10000,
};

/**
 * Class definition for WebSocket client
 */
export class WebSocketClient {
  public host: string;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private endpoint: WebSocket | null = null;
  private readonly eventEmitter: EventEmitter = new EventEmitter();

  /**
   * @constructor
   * @param {string} host - The host to connect to.
   * @param {IWebSocketClientConfig} [config=DEFAULT_CONFIG] - Configuration options for the WebSocket client.
   */
  constructor(host: string, private readonly config: IWebSocketClientConfig = DEFAULT_CONFIG) {
    this.host = host;
  }

  /**
   * Factory method to create and initialize a WebSocketClient instance
   *
   * @param {string} host - The host to connect to.
   * @returns {Promise<WebSocketClient>} The initialized WebSocketClient instance.
   */
  public static async create(host: string): Promise<WebSocketClient> {
    const client = new WebSocketClient(host);
    await client.open();
    return client;
  }

  /**
   * Handle incoming WebSocket messages.
   *
   * @private
   * @param {MessageEvent} event - The incoming message event.
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const jsonMessage = JSON.parse(event.data) as Message;
      this.eventEmitter.emit(jsonMessage.type, jsonMessage.data);
    } catch (error) {
      throw new MessageParseError(`Failed to parse message: ${error}`);
    }
  }

  /**
   * Authenticate the WebSocket client.
   *
   * @private
   * @returns {Promise<void>} Resolves when authentication is successful.
   */
  private async authenticate(): Promise<void> {
    try {
      const response = await axios.get(`http://${this.host}/auth`, {
        timeout: this.config.authenticationTimeout,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data !== "OK" || response.status !== 200) {
        throw new AuthenticationError("Authentication failed");
      }
    } catch (error) {
      throw new AuthenticationError(`Authentication failed: ${error}`);
    }
  }

  /**
   * Open the WebSocket connection.
   *
   * @public
   * @returns {Promise<void>} Resolves when the connection is successfully opened.
   */
  public async open(): Promise<void> {
    if (this.state === WebSocketState.CONNECTED) {
      console.log("WebSocket already connected. Skipping re-opening.");
      return;
    }

    this.state = WebSocketState.CONNECTING;

    try {
      await this.authenticate();
    } catch (error) {
      this.state = WebSocketState.DISCONNECTED;
      throw new AuthenticationError(`Authentication failed: ${error}`);
    }

    return new Promise<void>((resolve, reject) => {
      const endpoint = new WebSocket(`ws://${this.host}/api`);
      let timeoutId: NodeJS.Timeout;

      endpoint.onopen = () => {
        this.state = WebSocketState.CONNECTED;
        clearTimeout(timeoutId);
        this.endpoint = endpoint;
        this.eventEmitter.emit(WebSocketEvents.CONNECTED);
        resolve();
      };

      endpoint.onclose = () => {
        this.state = WebSocketState.DISCONNECTED;
        this.eventEmitter.emit(WebSocketEvents.DISCONNECTED);
      };

      endpoint.onmessage = (event: MessageEvent) => this.handleMessage(event);

      endpoint.onerror = (error: Event) => {
        clearTimeout(timeoutId);
        reject(new WebSocketOpenError(`WebSocket error: ${error}`));
      };

      timeoutId = setTimeout(() => {
        this.state = WebSocketState.DISCONNECTED;
        reject(new WebSocketOpenError("Connection timeout"));
      }, this.config.connectionTimeout);
    });
  }

  /**
   * Close the WebSocket connection.
   *
   * @public
   */
  public close(): void {
    if (this.endpoint) {
      this.endpoint.close();
      this.eventEmitter.emit(WebSocketEvents.DISCONNECTED);
    }
  }

  /**
   * Subscribe to a message type event.
   *
   * @public
   * @param {Message} message - The message type to subscribe to.
   * @param {Function} listener - The callback function to run when the event occurs.
   */
  public on(message: Message, listener: Function): void {
    this.eventEmitter.on(message.type, listener);
  }

  /**
   * Subscribe once to a message type event.
   *
   * @public
   * @param {Message} message - The message type to subscribe to.
   * @param {Function} listener - The callback function to run when the event occurs.
   */
  public once(message: Message, listener: Function): void {
    this.eventEmitter.once(message.type, listener);
  }

  /**
   * Send a message over the WebSocket connection.
   *
   * @public
   * @param {Message} message - The message to send.
   * @returns {Promise<void>} Resolves when the message is successfully sent.
   */
  public async send(message: Message): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const data = JSON.stringify(message);

      if (this.endpoint && this.endpoint.readyState === WebSocket.OPEN) {
        this.endpoint.send(data);
        resolve();
      } else {
        reject(new Error("WebSocket is not in the OPEN state"));
      }
    });
  }
}
