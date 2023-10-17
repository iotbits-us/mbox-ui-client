export class MessageParseError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "MessageParseError";
    }
  }
  