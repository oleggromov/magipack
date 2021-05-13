interface BitwiseOption {
  /**
   * Name of the options used in all methods
   */
  name: string;
  /**
   * Default size is 1 bit, that is read as true/false
   */
  size?: number;
  /**
   * bool is default for single-bit,
   * uint is default for multi-bit options
   */
  type?: BitwiseOptionType;
}

type BitwiseOptionType = 'bool' | 'uint';
type BitwiseOptionValue = boolean | number;

const MAX_BIT = 31;

// ToDo:
// - support signed integers
// - longer than 32 bit numbers

export default class BitwiseOptions {
  supported: Required<BitwiseOption>[];
  options: {
    [name: string]: {
      value: BitwiseOptionValue | undefined;
      options: Required<BitwiseOption>;
    };
  } = {};

  constructor(options: BitwiseOption[]) {
    let usedBits = 0;

    this.supported = options.map(inputOpt => {
      const size = this._getDefaultedSize(inputOpt);

      usedBits += size;
      if (usedBits > MAX_BIT) {
        throw error(`too many options, only up to ${MAX_BIT + 1} bits supported`);
      }

      const result: Required<BitwiseOption> = {
        name: inputOpt.name,
        size,
        type: this._getOptionType(inputOpt),
      };

      this.options[inputOpt.name] = {
        value: undefined,
        options: result,
      };

      return result;
    });
  }

  read(input: number): void {
    let bit = 0;

    if (input >= Math.pow(2, MAX_BIT + 1)) {
      throw error(`too long input, only ${MAX_BIT + 1}-bit integers supported`);
    }

    for (const option of this.supported) {
      const type = this._getOptionType(option);
      const mask = (Math.pow(2, option.size) - 1) << bit;
      const value = (input & mask) >> bit;

      this.options[option.name] = {
        value: type === 'bool' ? Boolean(value) : value,
        options: option,
      };

      bit += option.size;
    }
  }

  toNumber(): number {
    let result = 0;
    let bit = 0;

    for (const option of this.supported) {
      result |= Number(this.options[option.name].value) << bit;
      bit += option.size;
    }

    return result;
  }

  get(name: string): BitwiseOptionValue {
    this._throwOnUnsupportedOption(name);
    this._throwOnNoValue(name);

    return this.options[name].value as BitwiseOptionValue;
  }

  set(name: string, value: BitwiseOptionValue): void {
    this._throwOnUnsupportedOption(name);
    this._throwOnTypeMismatch(name, value);

    this.options[name].value = value;
  }

  _throwOnUnsupportedOption(name: string) {
    if (!this._isOptionSupported(name)) {
      throw error(`unsupported option "${name}"`);
    }
  }

  _throwOnTypeMismatch(name: string, value: BitwiseOptionValue) {
    const type = this.options[name].options.type;

    if ((type === 'bool' && typeof value === 'number')
      || (type === 'uint' && typeof value === 'boolean')) {
        throw error(`unsupported value of type "${typeof value}" for option "${name}" of type "${type}"`);
      }

    if (type === 'uint') {
      const bits = this.options[name].options.size;
      const maxVaue = Math.pow(2, bits) - 1;
      if (value > maxVaue) {
        throw error(`number ${value} is too big for a ${bits}-bit integer`);
      }
      if (value < 0) {
        throw error(`negative values are unsupported`);
      }
    }
  }

  _throwOnNoValue(name: string) {
    if (typeof this.options[name].value === 'undefined') {
      throw error(`option "${name}" value is unset`);
    }
  }

  _isOptionSupported(name: string) {
    return this.supported.findIndex(opt => name === opt.name) !== -1;
  }

  _getOptionType(option: BitwiseOption): BitwiseOptionType {
    const size = this._getDefaultedSize(option);

    if (size > 1) {
      if (option?.type === 'bool') {
        throw error(`unsupported bool type for option "${option.name}" of size ${size}`);
      }
      return 'uint';
    }

    return option.type || 'bool';
  }

  _getDefaultedSize(option: BitwiseOption): number {
    return option.size || 1;
  }
}

function error(msg: string) {
  return new Error(`BitwiseOptions: ${msg}`);
}
