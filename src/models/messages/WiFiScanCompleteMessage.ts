import { WiFiNetwork } from "$types";
import { Message } from "./Message";

export class WiFiScanCompleteMessage extends Message {
  public static readonly type: string = "wifi.scan.complete";

  constructor(data?: { networks: WiFiNetwork[] }) {
    super(WiFiScanCompleteMessage.type, data);
  }

  public static isWiFiScanMessage(message: Message<{ networks: WiFiNetwork[] }>): message is WiFiScanCompleteMessage {
    return message.type === WiFiScanCompleteMessage.type;
  }
}
