import { DeviceConfig } from "$types";
import { Message } from "./Message";

export class ConfigSetMessage extends Message {
  public static readonly type: string = "config.set";

  constructor(data?: DeviceConfig) {
    super(ConfigSetMessage.type, data);
  }

  public static isConfigSetMessage(message: Message<DeviceConfig>): message is ConfigSetMessage {
    return message.type === ConfigSetMessage.type;
  }
}
