import { Message } from "./Message";

export class ReloadMessage extends Message {
  public static readonly type: string = "reload";

  constructor(data?: any) {
    super(ReloadMessage.type, data);
  }

  public static isReloadMessage(message: Message<any>): message is ReloadMessage {
    return message.type === ReloadMessage.type;
  }
}
