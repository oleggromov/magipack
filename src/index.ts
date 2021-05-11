interface BitwiseOption {
  size: number;
  name: string;
}

export default class BitwiseOptions {
  supportedOptions: string[];

  constructor(options: BitwiseOption[]) {
    this.supportedOptions = [];
  }

  init(options: number) {

  }

  has(name?: string) {
    return true;
  }
}
