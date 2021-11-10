export interface MagipackOption {
  /**
   * Name of the options used in all methods
   */
  name: string;
  /**
   * Size in bits for of the option.
   */
  size: number;
  /**
   * Type can be one of:
   *  'bool' for booleans
   *  'uint' for unsigned ints
   *  'sint' for signed ints
   */
  type: MagipackOptionType;
}

export type MagipackOptionType = 'bool' | 'uint' | 'sint';

export type MagipackOptionMap = Record<string, MagipackInternalValue>;

// ToDo:
// - stronger typing
// - support ASCII

type MagipackInternalValue = boolean | bigint;
type InternalOption = {
  value: MagipackInternalValue | undefined;
  options: MagipackOption;
};

export default class Magipack {
  supported: MagipackOption[];
  options: Record<string, InternalOption> = {};

  constructor(options: MagipackOption[]) {
    this.supported = options.map(inputOpt => {
      const result: MagipackOption = {
        name: inputOpt.name,
        size: inputOpt.size,
        type: this.getOptionType(inputOpt),
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
      const mask = (powPositive(BigInt(2), BigInt(option.size)) - BigInt(1)) << bit;
      const value = (input & mask) >> bit;

      this.options[option.name] = {
        value: this.readOptionValue(option, value),
        options: option,
      };

      bit += BigInt(option.size);
    }
  }

  toNumber(): bigint {
    let result = BigInt(0);
    let bit = BigInt(0);

    for (const option of this.supported) {
      result |= this.writeOptionValue(this.options[option.name]) << bit;
      bit += BigInt(option.size);
    }

    return result;
  }

  toString(): string {
    return this.toNumber().toString();
  }

  get(name: string): MagipackInternalValue {
    this.throwOnUnsupportedOption(name);
    this.throwOnNoValue(name);

    return this.options[name].value as MagipackInternalValue;
  }

  getAll(): MagipackOptionMap {
    const result: MagipackOptionMap = {}
    Object.keys(this.options).forEach((key) => {
      result[key] = this.get(key);
    });
    return result;
  }

  set(name: string, value: MagipackInternalValue): void {
    this.throwOnUnsupportedOption(name);
    this.throwOnTypeMismatch(name, value);

    this.options[name].value = value;
  }

  setAll(values: MagipackOptionMap): void {
    const remaining = new Set(Object.keys(this.options));
    Object.entries(values).forEach(([key, value]) => {
      this.set(key, value);
      remaining.delete(key);
    });
    if (remaining.size) {
      throw error(`setAll missing keys - ${[...remaining.keys()].toString()}`);
    }
  }

  private readOptionValue(option: MagipackOption, value: bigint): MagipackInternalValue {
    if (option.type === 'bool') {
      return Boolean(value);
    }
    if (option.type === 'uint') {
      return value;
    }

    return this.readSignedValue(option, value);
  }

  private readSignedValue(option: MagipackOption, value: bigint): bigint {
    const significantBits = BigInt(option.size - 1);

    const signMask = BigInt(1) << (significantBits);
    const valueMask = powPositive(BigInt(2), significantBits) - BigInt(1);

    const isNegative = Boolean((value & signMask) >> significantBits);
    const maskedValue = value & valueMask;

    return isNegative ? -maskedValue : maskedValue;
  }

  private writeOptionValue(option: InternalOption): bigint {
    const {type, size} = option.options;
    const value = BigInt(option.value ?? 0);

    if (type === 'bool' || type === 'uint') {
      return BigInt(value);
    }

    return this.writeSignedValue(value, size);
  }

  private writeSignedValue(value: bigint, size: number): bigint {
    const significantBits = BigInt(size - 1);

    const signBit = value < 0 ? BigInt(1) : BigInt(0);
    const absoluteValue = value < 0 ? value * BigInt(-1) : value;

    const signMask = (signBit << significantBits);
    const valueMask = powPositive(BigInt(2), significantBits) - BigInt(1);

    return signMask | (absoluteValue & valueMask);
  }

  private throwOnUnsupportedOption(name: string) {
    if (!this.isOptionSupported(name)) {
      throw error(`unsupported option "${name}"`);
    }
  }

  private throwOnTypeMismatch(name: string, value: MagipackInternalValue) {
    const {type, size} = this.options[name].options;

    if (typeof value === 'bigint') {
      if (type === 'bool') {
        throw error(`cannot assign bigint value to 'bool' option '${name}'`);
      }
    }

    if (typeof value === 'boolean') {
      if (type === 'uint' || type === 'sint') {
        throw error(`cannot assign boolean value to '${type}' option ${name}`);
      }
    }

    if (type === 'uint') {
      const maxValue = powPositive(BigInt(2), BigInt(size)) - BigInt(1);
      if (value > maxValue) {
        throw error(`number ${value} is too big for a ${size}-bit unsigned int`);
      }
      if (value < BigInt(0)) {
        throw error(`for negative values use 'sint' type`);
      }
    }

    if (type === 'sint') {
      const maxValue = powPositive(BigInt(2), BigInt(size - 1)) - BigInt(1);
      if (value > maxValue || value < -maxValue) {
        throw error(`number ${value} has too many significant bits for a ${size}-bit signed integer`);
      }
    }
  }

  private throwOnNoValue(name: string) {
    if (typeof this.options[name].value === 'undefined') {
      throw error(`option "${name}" value is unset`);
    }
  }

  private isOptionSupported(name: string) {
    return this.supported.findIndex(opt => name === opt.name) !== -1;
  }

  private getOptionType(option: MagipackOption): MagipackOptionType {
    const {name, size, type} = option;

    if (!name || !size || !type) {
      throw error('Each of (name, size, type) properties are required for options');
    }

    if (size === 1) {
      if (option.type === 'sint') {
        throw error(`unsupported 'sint' type option '${option.name}' for size === 1`);
      }
      return option.type;
    }

    if (option.type === 'bool') {
      throw error(`unsupported 'bool' type for option '${option.name}' of size ${size}`);
    }

    return option.type;
  }
}

function error(msg: string) {
  return new Error(`Magipack: ${msg}`);
}

function powPositive(base: bigint, power: bigint) {
  if (power < 1) {
    throw new Error('power < 1 is not supported');
  }

  let result = base;
  for (let i = BigInt(1); i < power; i++) {
    result = result * base;
  }
  return result;
}
