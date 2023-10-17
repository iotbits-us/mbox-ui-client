import { Message } from "./Message";

export class SlaveExecMessage extends Message {
  public static readonly type: string = "slave.exec";

  constructor(data?: any) {
    super(SlaveExecMessage.type, data);
  }

  public static isSlaveExecMessage(message: Message<any>): message is SlaveExecMessage {
    return message.type === SlaveExecMessage.type;
  }
}
