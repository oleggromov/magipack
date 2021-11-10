import Magipack from './index';

const ERROR_REGEX = /^Magipack/;

describe('Magipack', () => {
  describe('single bit options', () => {
    let magipack: Magipack;

    beforeEach(() => {
      magipack = new Magipack([
        {name: 'first', size: 1, type: 'bool'},
        {name: 'second', size: 1, type: 'bool'},
        {name: 'third', size: 1, type: 'bool'},
        {name: 'fourth', size: 1, type: 'bool'},
      ]);
    });

    it('reads single bit options', () => {
      magipack.read(BigInt(13));
      expect(magipack.get('first')).toBe(true);
      expect(magipack.get('second')).toBe(false);
      expect(magipack.get('third')).toBe(true);
      expect(magipack.get('fourth')).toBe(true);
    });

    it('throws without input at all', () => {
      expect(() => magipack.get('first')).toThrowError(ERROR_REGEX);
    });

    it('sets default values on 0 input', () => {
      magipack.read(BigInt(0));
      expect(magipack.get('first')).toBe(false);
      expect(magipack.get('second')).toBe(false);
      expect(magipack.get('third')).toBe(false);
      expect(magipack.get('fourth')).toBe(false);
    });

    it('ignores unknown options in input', () => {
      magipack.read(BigInt(16));
      expect(magipack.get('first')).toBe(false);
      expect(magipack.get('second')).toBe(false);
      expect(magipack.get('third')).toBe(false);
      expect(magipack.get('fourth')).toBe(false);
    });

    it('sets single options correctly', () => {
      magipack.set('first', true);
      magipack.set('third', true);
      magipack.set('fourth', true);
      expect(magipack.toNumber()).toBe(BigInt(13));
    });

    it('throws on getting/setting unknown option', () => {
      magipack.read(BigInt(3));
      expect(() => magipack.get('fifth')).toThrowError(ERROR_REGEX);
      expect(() => magipack.set('fifth', true)).toThrowError(ERROR_REGEX);
    });
  });

  describe('multi-bit options', () => {
    let magipack: Magipack;

    beforeEach(() => {
      magipack = new Magipack([
        {name: 'first_2bit', size: 2, type: 'uint'},
        {name: 'second_bool', size: 1, type: 'bool'},
        {name: 'third_5bit', size: 5, type: 'uint'},
        {name: 'fourth_4bit', size: 4, type: 'uint'},
      ]);
    });

    it('reads multi-bit options', () => {
      magipack.read(BigInt(2542)); // 1001,11101,1,10 = 9,29,1,2
      expect(magipack.get('first_2bit')).toBe(BigInt(2));
      expect(magipack.get('second_bool')).toBe(true);
      expect(magipack.get('third_5bit')).toBe(BigInt(29));
      expect(magipack.get('fourth_4bit')).toBe(BigInt(9));
    });

    it('reads single-bit as a number', () => {
      const magipack = new Magipack([
        {name: 'first', type: 'bool', size: 1},
        {name: 'second', type: 'uint', size: 1},
        {name: 'third', type: 'uint', size: 1},
      ]);
      magipack.read(BigInt(5));
      expect(magipack.get('first')).toBe(true);
      expect(magipack.get('second')).toBe(BigInt(0));
      expect(magipack.get('third')).toBe(BigInt(1));
    });

    it('sets multi-bit options correctly', () => {
      magipack.set('first_2bit', BigInt(0));
      magipack.set('second_bool', true);
      magipack.set('third_5bit', BigInt(31));
      expect(magipack.toNumber()).toBe(BigInt(252));
    });

    it('throws on signed ints', () => {
      expect(() => magipack.set('third_5bit', BigInt(-3))).toThrowError(ERROR_REGEX);
    });

    it('throws if option value is incorrect', () => {
      expect(() => magipack.set('fourth_4bit', BigInt(16))).toThrowError(ERROR_REGEX);
      expect(() => magipack.set('second_bool', BigInt(1))).toThrowError(ERROR_REGEX);
    });

    it('ignores unknown options in input', () => {
      magipack.read(BigInt(30851)); // 111,1000,10000,0,11
      expect(magipack.get('first_2bit')).toBe(BigInt(3));
      expect(magipack.get('second_bool')).toBe(false);
      expect(magipack.get('third_5bit')).toBe(BigInt(16));
      expect(magipack.get('fourth_4bit')).toBe(BigInt(8));
    });

    it('throws on getting/setting unknown option', () => {
      magipack.read(BigInt(0));
      expect(() => magipack.set('no one', BigInt(0))).toThrowError(ERROR_REGEX);
      expect(() => magipack.set('hello', BigInt(0))).toThrowError(ERROR_REGEX);
    });
  });

  describe('BigInt', () => {
    it('reads a 129-bit bigint into a 64- and 65-bit bigints', () => {
      const magipack = new Magipack([
        {name: '64_bit', size: 64, type: 'uint'},
        {name: '65_bit', size: 65, type: 'uint'}
      ]);
      magipack.read(BigInt('481966290129121909553755495609654715551'));
      expect(magipack.get('64_bit')).toBe(BigInt('9943143236341736607')); // 1000100111111101001001000001011110101000111110100010010010011111
      expect(magipack.get('65_bit')).toBe(BigInt('26127444941138645284')); // 10110101010010111010101001011111010101101001001010101000100100100
    });

    it('reads a 129 big int into 4 x 32 bit & 1 bit', () => {
      const magipack = new Magipack([
        {name: 'first', size: 32, type: 'uint'},
        {name: 'second', size: 1, type: 'uint'},
        {name: 'third', size: 32, type: 'uint'},
        {name: 'fourth', size: 32, type: 'uint'},
        {name: 'fifth', size: 32, type: 'uint'},
      ]);
      magipack.read(BigInt('481966290129121909553755495609654715551'));
      expect(magipack.get('first')).toBe(BigInt(2834965663)); // 10101000111110100010010010011111
      expect(magipack.get('second')).toBe(BigInt(1)); // 1
      expect(magipack.get('third')).toBe(BigInt(1157534219)); // 01000100111111101001001000001011
      expect(magipack.get('fourth')).toBe(BigInt(1452451986)); // 01010110100100101010100010010010
      expect(magipack.get('fifth')).toBe(BigInt(3041634911)); // 10110101010010111010101001011111
    });

    it('sets 5 × 25 bit int values correctly', () => {
      const magipack = new Magipack([
        {name: 'first', size: 25, type: 'uint'},
        {name: 'second', size: 25, type: 'uint'},
        {name: 'third', size: 25, type: 'uint'},
      ]);
      magipack.set('first', BigInt(11105611)); // 0101010010111010101001011
      magipack.set('second', BigInt(33367063)); // 1111111010010010000010111
      magipack.set('third', BigInt(20587679)); // 1001110100010010010011111
      expect(magipack.toNumber()).toBe(BigInt('23179666987818704008523'));
    });

    it('returns correct bigint string', () => {
      const magipack = new Magipack([
        {name: 'first', size: 129, type: 'uint'},
      ]);
      magipack.read(BigInt('481966290129121909553755495609654715551'));
      expect(magipack.toString()).toBe('481966290129121909553755495609654715551');
    });
  });

  describe('signed integers', () => {
    let magipack: Magipack;

    beforeEach(() => {
      magipack = new Magipack([
        {name: 'first', size: 4, type: 'sint'},
      ])
    });

    it('sets signed multi-bit ints', () => {
      magipack.set('first', BigInt(-3));
      expect(magipack.get('first')).toBe(BigInt(-3)); // 1011
      expect(magipack.toString()).toBe('11');
      magipack.set('first', BigInt(3));
      expect(magipack.get('first')).toBe(BigInt(3)); // 0011
      expect(magipack.toString()).toBe('3');
    });

    it('reads multi-bit signed ints', () => {
      magipack.read(BigInt(15)); // 1111
      expect(magipack.get('first')).toBe(BigInt(-7));
      magipack.read(BigInt(7)); // 0111
      expect(magipack.get('first')).toBe(BigInt(7));
      magipack.read(BigInt(0)); // 0111
      expect(magipack.get('first')).toBe(BigInt(0));
    });

    it('throws on a single bit signed', () => {
      expect(() => {
        new Magipack([
          {name: 'wrong', size: 1, type: 'sint'}
        ]);
      }).toThrowError(ERROR_REGEX);
    });

    it('calculates max value correctly', () => {
      expect(() => {
        magipack.set('first', BigInt(-8));
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        magipack.set('first', BigInt(8));
      }).toThrowError(ERROR_REGEX);
    });
  });

  describe('getAll/setAll', () => {
    let magipack: Magipack;

    beforeEach(() => {
      magipack = new Magipack([
        {name: 'first', size: 4, type: 'uint'},
        {name: 'second', size: 4, type: 'uint'},
      ])
    });

    it('sets all values at once', () => {
      magipack.setAll({
        first: BigInt(3),
        second: BigInt(2),
      });
      expect(magipack.get('first')).toBe(BigInt(3));
      expect(magipack.get('second')).toBe(BigInt(2));
    });

    it('throws on incomplete/extra input for setAll', () => {
      expect(() => {
        magipack.setAll({
          first: BigInt(3),
        });
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        magipack.setAll({
          first: BigInt(3),
          second: BigInt(4),
          third: BigInt(5),
        });
      }).toThrowError(ERROR_REGEX);
    });

    it('returns all values at once', () => {
      magipack.setAll({
        first: BigInt(8),
        second: BigInt(12),
      });
      expect(magipack.getAll()).toEqual({
        first: BigInt(8),
        second: BigInt(12),
      });
    });

    it('throws when undefined options are found for getAll', () => {
      magipack.set('first', BigInt(3));
      expect(() => {
        magipack.getAll();
      }).toThrowError(ERROR_REGEX);
    });
  });

  describe('API typing and exceptions', () => {
    it('requires all option parameters', () => {
      expect(() => {
        // @ts-expect-error
        new Magipack([{}]);
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        // @ts-expect-error
        new Magipack([{name: 'default'}]);
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        // @ts-expect-error
        new Magipack([{name: 'default', size: 2}]);
      }).toThrowError(ERROR_REGEX);
      expect(() => {
        // @ts-expect-error
        new Magipack([{name: 'default', type: 'uint'}]);
      }).toThrowError(ERROR_REGEX);
    });
  });
});
