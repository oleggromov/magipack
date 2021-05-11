interface BitwiseOption {
  /**
   * Default size is 1 bit, that is true/false
   */
  size?: number;
  /**
   * Name of the options used in all methods
   */
  name: string;
}

const MAX_BIT = 31;

// ToDo: support non-boolean values

export default class BitwiseOptions {
  supported: BitwiseOption[];
  options: {
    [name: string]: boolean;
  } = {};

  constructor(options: BitwiseOption[]) {
    let usedBits = 0;

    this.supported = options.map(inputOpt => {
      const size = inputOpt.size || 1;

      usedBits += size;
      if (usedBits > MAX_BIT) {
        throw error(`too many options, only up to ${MAX_BIT + 1} bits supported`);
      }

      return {
        size,
        name: inputOpt.name,
      };
    });
  }

  read(input: number): void {
    let bit = 0;

    if (input >= Math.pow(2, MAX_BIT + 1)) {
      throw error(`too long input, only ${MAX_BIT + 1}-bit integers supported`);
    }

    for (const option of this.supported) {
      this.options[option.name] = Boolean(input & Math.pow(2, bit));
      bit += 1;
    }
  }

  toNumber(): number {
    let result = 0;
    let bit = 0;

    for (const option of this.supported) {
      const value = this.options[option.name] ? Math.pow(2, bit) : 0;
      result |= value;
      bit += 1;
    }

    return result;
  }

  get(name: string): boolean {
    this._throwOnUnsupportedOption(name);

    return this.options[name];
  }

  set(name: string, value: boolean): void {
    this._throwOnUnsupportedOption(name);

    this.options[name] = value;
  }

  _throwOnUnsupportedOption(name: string) {
    if (!this._isOptionSupported(name)) {
      throw error(`unsupported option ${name}`);
    }
  }

  _isOptionSupported(name: string) {
    return this.supported.findIndex(opt => name === opt.name) !== -1;
  }
}

function error(msg: string) {
  return new Error(`BitwiseOptions: ${msg}`);
}
