import { ISettings } from "$types";
import { Message } from "./Message";


export class SettingsListMessage extends Message {
  public static readonly type: string = "settings.list";

  constructor(data?: ISettings) {
    super(SettingsListMessage.type, data);
  }

  public static isSettingsListMessage(message: Message<ISettings>): message is SettingsListMessage {
    return message.type === SettingsListMessage.type;
  }
}

export class SettingsSetMessage extends Message {
  public static readonly type: string = "settings.set";

  constructor(data?: ISettings) {
    super(SettingsSetMessage.type, data);
  }

  public static isSettingsSetMessage(message: Message<ISettings>): message is SettingsSetMessage {
    return message.type === SettingsSetMessage.type;
  }
}
