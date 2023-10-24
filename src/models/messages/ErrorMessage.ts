import { Message } from "./Message";

export class ErrorMessage extends Message {
  public static readonly type: string = "error";

  constructor(data?: { error_code: string }) {
    super(ErrorMessage.type, data);
  }

  public static isErrorMessage(message: Message<Error>): message is ErrorMessage {
    return message.type === ErrorMessage.type;
  }
}
