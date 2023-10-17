import { Message } from "./Message";

export class LocateMessage extends Message {
  public static readonly type: string = "locate";

  constructor(data?: any) {
    super(LocateMessage.type, data);
  }

  public static isLocateMessage(message: Message<any>): message is LocateMessage {
    return message.type === LocateMessage.type;
  }
}
