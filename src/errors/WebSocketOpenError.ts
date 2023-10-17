export class WebSocketOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebSocketOpenError";
  }
}
