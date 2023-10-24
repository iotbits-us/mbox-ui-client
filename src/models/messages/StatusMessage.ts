import { DeviceStatus } from "$types";
import { Message } from "./Message";

export class StatusMessage extends Message {
  public static readonly type: string = "status";

  constructor(data?: DeviceStatus) {
    super(StatusMessage.type, data);
  }

  public static isStatusMessage(message: Message<DeviceStatus>): message is StatusMessage {
    return message.type === StatusMessage.type;
  }
}
