import BitwiseOptions from './index';

const ERROR_REGEX = /^BitwiseOption/;

describe('BitwiseOptions', () => {
  describe('single bit options', () => {
    let bo: BitwiseOptions;

    beforeEach(() => {
      bo = new BitwiseOptions([
        {name: 'first', size: 1, type: 'bool'},
        {name: 'second', size: 1, type: 'bool'},
        {name: 'third', size: 1, type: 'bool'},
        {name: 'fourth', size: 1, type: 'bool'},
      ]);
    });

    it('reads single bit options', () => {
      bo.read(BigInt(13));
      expect(bo.get('first')).toBe(true);
      expect(bo.get('second')).toBe(false);
      expect(bo.get('third')).toBe(true);
      expect(bo.get('fourth')).toBe(true);
    });

    it('throws without input at all', () => {
      expect(() => bo.get('first')).toThrowError(ERROR_REGEX);
    });

    it('sets default values on 0 input', () => {
      bo.read(BigInt(0));
      expect(bo.get('first')).toBe(false);
      expect(bo.get('second')).toBe(false);
      expect(bo.get('third')).toBe(false);
      expect(bo.get('fourth')).toBe(false);
    });

    it('ignores unknown options in input', () => {
      bo.read(BigInt(16));
      expect(bo.get('first')).toBe(false);
      expect(bo.get('second')).toBe(false);
      expect(bo.get('third')).toBe(false);
      expect(bo.get('fourth')).toBe(false);
    });

    it('sets single options correctly', () => {
      bo.set('first', true);
      bo.set('third', true);
      bo.set('fourth', true);
      expect(bo.toNumber()).toBe(BigInt(13));
    });

    it('throws on getting/setting unknown option', () => {
      bo.read(BigInt(3));
      expect(() => bo.get('fifth')).toThrowError(ERROR_REGEX);
      expect(() => bo.set('fifth', true)).toThrowError(ERROR_REGEX);
    });
  });

  describe('multi-bit options', () => {
    let bo: BitwiseOptions;

    beforeEach(() => {
      bo = new BitwiseOptions([
        {name: 'first_2bit', size: 2, type: 'uint'},
        {name: 'second_bool', size: 1, type: 'bool'},
        {name: 'third_5bit', size: 5, type: 'uint'},
        {name: 'fourth_4bit', size: 4, type: 'uint'},
      ]);
    });

    it('reads multi-bit options', () => {
      bo.read(BigInt(2542)); // 1001,11101,1,10 = 9,29,1,2
      expect(bo.get('first_2bit')).toBe(BigInt(2));
      expect(bo.get('second_bool')).toBe(true);
      expect(bo.get('third_5bit')).toBe(BigInt(29));
      expect(bo.get('fourth_4bit')).toBe(BigInt(9));
    });

    it('reads single-bit as a number', () => {
      const bo = new BitwiseOptions([
        {name: 'first', type: 'bool', size: 1},
        {name: 'second', type: 'uint', size: 1},
        {name: 'third', type: 'uint', size: 1},
      ]);
      bo.read(BigInt(5));
      expect(bo.get('first')).toBe(true);
      expect(bo.get('second')).toBe(BigInt(0));
      expect(bo.get('third')).toBe(BigInt(1));
    });

    it('sets multi-bit options correctly', () => {
      bo.set('first_2bit', BigInt(0));
      bo.set('second_bool', true);
      bo.set('third_5bit', BigInt(31));
      expect(bo.toNumber()).toBe(BigInt(252));
    });

    it('throws on signed ints', () => {
      expect(() => bo.set('third_5bit', BigInt(-3))).toThrowError(ERROR_REGEX);
    });

    it('throws if option value is incorrect', () => {
      expect(() => bo.set('fourth_4bit', BigInt(16))).toThrowError(ERROR_REGEX);
      expect(() => bo.set('second_bool', BigInt(1))).toThrowError(ERROR_REGEX);
    });

    it('ignores unknown options in input', () => {
      bo.read(BigInt(30851)); // 111,1000,10000,0,11
      expect(bo.get('first_2bit')).toBe(BigInt(3));
      expect(bo.get('second_bool')).toBe(false);
      expect(bo.get('third_5bit')).toBe(BigInt(16));
      expect(bo.get('fourth_4bit')).toBe(BigInt(8));
    });

    it('throws on getting/setting unknown option', () => {
      bo.read(BigInt(0));
      expect(() => bo.set('no one', BigInt(0))).toThrowError(ERROR_REGEX);
      expect(() => bo.set('hello', BigInt(0))).toThrowError(ERROR_REGEX);
    });
  });

  describe('BigInt', () => {
    it('reads a 129-bit bigint into a 64- and 65-bit bigints', () => {
      const bo = new BitwiseOptions([
        {name: '64_bit', size: 64, type: 'uint'},
        {name: '65_bit', size: 65, type: 'uint'}
      ]);
      bo.read(BigInt('481966290129121909553755495609654715551'));
      expect(bo.get('64_bit')).toBe(BigInt('9943143236341736607')); // 1000100111111101001001000001011110101000111110100010010010011111
      expect(bo.get('65_bit')).toBe(BigInt('26127444941138645284')); // 10110101010010111010101001011111010101101001001010101000100100100
    });

    it('reads a 129 big int into 4 x 32 bit & 1 bit', () => {
      const bo = new BitwiseOptions([
        {name: 'first', size: 32, type: 'uint'},
        {name: 'second', size: 1, type: 'uint'},
        {name: 'third', size: 32, type: 'uint'},
        {name: 'fourth', size: 32, type: 'uint'},
        {name: 'fifth', size: 32, type: 'uint'},
      ]);
      bo.read(BigInt('481966290129121909553755495609654715551'));
      expect(bo.get('first')).toBe(BigInt(2834965663)); // 10101000111110100010010010011111
      expect(bo.get('second')).toBe(BigInt(1)); // 1
      expect(bo.get('third')).toBe(BigInt(1157534219)); // 01000100111111101001001000001011
      expect(bo.get('fourth')).toBe(BigInt(1452451986)); // 01010110100100101010100010010010
      expect(bo.get('fifth')).toBe(BigInt(3041634911)); // 10110101010010111010101001011111
    });

    it('sets 5 × 25 bit int values correctly', () => {
      const bo = new BitwiseOptions([
        {name: 'first', size: 25, type: 'uint'},
        {name: 'second', size: 25, type: 'uint'},
        {name: 'third', size: 25, type: 'uint'},
      ]);
      bo.set('first', BigInt(11105611)); // 0101010010111010101001011
      bo.set('second', BigInt(33367063)); // 1111111010010010000010111
      bo.set('third', BigInt(20587679)); // 1001110100010010010011111
      expect(bo.toNumber()).toBe(BigInt('23179666987818704008523'));
    });

    it('returns correct bigint string', () => {
      const bo = new BitwiseOptions([
        {name: 'first', size: 129, type: 'uint'},
      ]);
      bo.read(BigInt('481966290129121909553755495609654715551'));
      expect(bo.toString()).toBe('481966290129121909553755495609654715551');
    });
  });

  describe('signed integers', () => {
    let bo: BitwiseOptions;

    beforeEach(() => {
      bo = new BitwiseOptions([
        {name: 'first', size: 4, type: 'sint'},
      ])
    });

    it('sets signed multi-bit ints', () => {
      bo.set('first', BigInt(-3));
      expect(bo.get('first')).toBe(BigInt(-3)); // 1011
      expect(bo.toString()).toBe('11');
      bo.set('first', BigInt(3));
      expect(bo.get('first')).toBe(BigInt(3)); // 0011
      expect(bo.toString()).toBe('3');
    });

    it('reads multi-bit signed ints', () => {
      bo.read(BigInt(15)); // 1111
      expect(bo.get('first')).toBe(BigInt(-7));
      bo.read(BigInt(7)); // 0111
      expect(bo.get('first')).toBe(BigInt(7));
      bo.read(BigInt(0)); // 0111
      expect(bo.get('first')).toBe(BigInt(0));
    });

    it('throws on a single bit signed', () => {
      expect(() => {
        new BitwiseOptions([
          {name: 'wrong', size: 1, type: 'sint'}
        ]);
      }).toThrowError(ERROR_REGEX);
    });

    it('calculates max value correctly', () => {
      expect(() => {
        bo.set('first', BigInt(-8));
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        bo.set('first', BigInt(8));
      }).toThrowError(ERROR_REGEX);
    });
  });

  describe('API typing and exceptions', () => {
    it('requires all option parameters', () => {
      expect(() => {
        // @ts-expect-error
        new BitwiseOptions([{}]);
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        // @ts-expect-error
        new BitwiseOptions([{name: 'default'}]);
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        // @ts-expect-error
        new BitwiseOptions([{name: 'default', size: 2}]);
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        // @ts-expect-error
        new BitwiseOptions([{name: 'default', type: 'uint'}]);
      }).toThrowError(ERROR_REGEX);
    });
  });
});
