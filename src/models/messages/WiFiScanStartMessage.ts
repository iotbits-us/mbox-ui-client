import { Message } from "./Message";

export class WiFiScanStartMessage extends Message {
  public static readonly type: string = "wifi.scan.start";

  constructor(data?: any) {
    super(WiFiScanStartMessage.type, data);
  }

  public static isWiFiScanMessage(message: Message<any>): message is WiFiScanStartMessage {
    return message.type === WiFiScanStartMessage.type;
  }
}
