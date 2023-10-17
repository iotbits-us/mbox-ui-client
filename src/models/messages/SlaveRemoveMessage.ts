import { Message } from "./Message";

export class SlaveRemoveMessage extends Message {
  public static readonly type: string = "slave.remove";

  constructor(data?: any) {
    super(SlaveRemoveMessage.type, data);
  }

  public static isSlaveRemoveMessage(message: Message<any>): message is SlaveRemoveMessage {
    return message.type === SlaveRemoveMessage.type;
  }
}
