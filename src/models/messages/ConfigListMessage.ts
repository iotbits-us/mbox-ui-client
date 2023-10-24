import { DeviceConfig } from "$types";
import { Message } from "./Message";

export class ConfigListMessage extends Message {
  public static readonly type: string = "config.list";

  constructor(data?: DeviceConfig) {
    super(ConfigListMessage.type, data);
  }

  public static isConfigListMessage(message: Message<DeviceConfig>): message is ConfigListMessage {
    return message.type === ConfigListMessage.type;
  }
}
