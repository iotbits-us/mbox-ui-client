import { IHostStatus } from "$types";
import { Message } from "./Message";

export class HostStatusMessage extends Message {
  public static readonly type: string = "status";

  constructor(data?: IHostStatus) {
    super(HostStatusMessage.type, data);
  }

  public static isHostStatusMessage(message: Message<IHostStatus>): message is HostStatusMessage {
    return message.type === HostStatusMessage.type;
  }
}
