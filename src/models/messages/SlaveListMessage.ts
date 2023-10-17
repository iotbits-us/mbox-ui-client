import { Message } from "./Message";

export class SlaveListMessage extends Message {
  public static readonly type: string = "slave.list";

  constructor(data?: any) {
    super(SlaveListMessage.type, data);
  }

  public static isSlaveListMessage(message: Message<any>): message is SlaveListMessage {
    return message.type === SlaveListMessage.type;
  }
}
