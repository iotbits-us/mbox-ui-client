import { Message } from "./Message";
import { IErrorMessage } from "$types";

export class ErrorMessage extends Message {
  public static readonly type: string = "error";

  constructor(data?: IErrorMessage) {
    super(ErrorMessage.type, data);
  }

  public static isErrorMessage(message: Message<Error>): message is ErrorMessage {
    return message.type === ErrorMessage.type;
  }
}
