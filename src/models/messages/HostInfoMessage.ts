import { IHostInfo } from "$types";
import { Message } from "./Message";

export class HostInfoMessage extends Message {
  public static readonly type: string = "info";

  constructor(data?: IHostInfo) {
    super(HostInfoMessage.type, data);
  }

  public static isHostInfoMessage(message: Message<IHostInfo>): message is HostInfoMessage {
    return message.type === HostInfoMessage.type;
  }
}
