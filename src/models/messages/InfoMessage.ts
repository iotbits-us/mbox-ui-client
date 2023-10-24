import { DeviceInfo } from "$types";
import { Message } from "./Message";

export class InfoMessage extends Message {
  public static readonly type: string = "info";

  constructor(data?: DeviceInfo) {
    super(InfoMessage.type, data);
  }

  public static isInfoMessage(message: Message<DeviceInfo>): message is InfoMessage {
    return message.type === InfoMessage.type;
  }
}
