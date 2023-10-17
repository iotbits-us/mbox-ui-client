import { Message } from "./Message";

export class RebootMessage extends Message {
  public static readonly type: string = "reboot";

  constructor(data?: any) {
    super(RebootMessage.type, data);
  }

  public static isRebootMessage(message: Message<any>): message is RebootMessage {
    return message.type === RebootMessage.type;
  }
}
