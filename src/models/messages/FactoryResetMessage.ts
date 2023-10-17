import { Message } from "./Message";

export class FactoryResetMessage extends Message {
  public static readonly type: string = "factory";

  constructor(data?: any) {
    super(FactoryResetMessage.type, data);
  }

  public static isFactoryResetMessage(message: Message<any>): message is FactoryResetMessage {
    return message.type === FactoryResetMessage.type;
  }
}
