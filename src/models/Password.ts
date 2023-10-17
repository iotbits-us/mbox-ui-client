export class Password {
    private _pass: string;
    private _confirm: string;
    constructor(pass?: string, confirm?: string) {
      this._pass = pass || "";
      this._confirm = confirm || "";
    }
    get password(): string {
      return this._pass;
    }
    get confirm(): string {
      return this._confirm;
    }
    set password(value: string) {
      this._pass = value;
    }
    set confirm(value: string) {
      this._confirm = value;
    }
  }
  