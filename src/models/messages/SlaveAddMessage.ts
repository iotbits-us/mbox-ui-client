import { Message } from "./Message";

export class SlaveAddMessage extends Message {
  public static readonly type: string = "slave.add";

  constructor(data: any) {
    super(SlaveAddMessage.type, data);
  }

  public static isSlaveAddMessage(message: Message<any>): message is SlaveAddMessage {
    return message.type === SlaveAddMessage.type;
  }
}
