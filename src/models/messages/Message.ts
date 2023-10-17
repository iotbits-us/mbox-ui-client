export class Message<T = any> {
  public readonly type: string;
  public data?: T;

  public constructor(type: string, data: T = {} as T) {
    this.type = type;
    this.data = data;
  }
}
