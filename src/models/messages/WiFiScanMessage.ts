import { Message } from "./Message";

export class WiFiScanMessage extends Message {
  public static readonly type: string = "wifi.scan";

  constructor(data?: any) {
    super(WiFiScanMessage.type, data);
  }

  public static isWiFiScanMessage(message: Message<any>): message is WiFiScanMessage {
    return message.type === WiFiScanMessage.type;
  }
}
