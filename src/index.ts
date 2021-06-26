export interface BitwiseOption {
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

export type BitwiseOptionType = 'bool' | 'uint';
export type BitwiseOptionValue = boolean | bigint;

// ToDo:
// - support signed integers
// - support ASCII

export default class BitwiseOptions {
  supported: Required<BitwiseOption>[];
  options: Record<string, {
    value: BitwiseOptionValue | undefined;
    options: Required<BitwiseOption>;
  }> = {};

  constructor(options: BitwiseOption[]) {
    this.supported = options.map(inputOpt => {
      const size = this._getDefaultedSize(inputOpt);

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

  read(input: bigint): void {
    let bit = BigInt(0);
    for (const option of this.supported) {
      const type = this._getOptionType(option);
      const mask = (BigInt(2) ** BigInt(option.size) - BigInt(1)) << bit;
      const value = (input & mask) >> bit;

      this.options[option.name] = {
        value: type === 'bool' ? Boolean(value) : value,
        options: option,
      };

      bit += BigInt(option.size);
    }
  }

  toNumber(): bigint {
    let result = BigInt(0);
    let bit = BigInt(0);

    for (const option of this.supported) {
      result |= BigInt(this.options[option.name].value ?? 0) << bit;
      bit += BigInt(option.size);
    }

    return result;
  }

  toString(): string {
    return this.toNumber().toString();
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

    if ((type === 'bool' && typeof value === 'bigint')
      || (type === 'uint' && typeof value === 'boolean')) {
        throw error(`unsupported value of type "${typeof value}" for option "${name}" of type "${type}"`);
      }

    if (type === 'uint') {
      const bits = this.options[name].options.size;
      const maxValue = BigInt(2) ** BigInt(bits) - BigInt(1);
      if (value > maxValue) {
        throw error(`number ${value} is too big for a ${bits}-bit integer`);
      }
      if (value < BigInt(0)) {
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
