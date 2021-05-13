import BitwiseOptions from './index';

const ERROR_REGEX = /^BitwiseOption/;

describe('BitwiseOptions', () => {
  describe('single bit options', () => {
    let bo: BitwiseOptions;

    beforeEach(() => {
      bo = new BitwiseOptions([
        {name: 'first'},
        {name: 'second'},
        {name: 'third'},
        {name: 'fourth'},
      ]);
    });

    it('reads single bit options', () => {
      bo.read(13);
      expect(bo.get('first')).toBe(true);
      expect(bo.get('second')).toBe(false);
      expect(bo.get('third')).toBe(true);
      expect(bo.get('fourth')).toBe(true);
    });

    it('throws without input at all', () => {
      expect(() => bo.get('first')).toThrowError(ERROR_REGEX);
    });

    it('sets default values on 0 input', () => {
      bo.read(0);
      expect(bo.get('first')).toBe(false);
      expect(bo.get('second')).toBe(false);
      expect(bo.get('third')).toBe(false);
      expect(bo.get('fourth')).toBe(false);
    });

    it('ignores unknown options in input', () => {
      bo.read(16);
      expect(bo.get('first')).toBe(false);
      expect(bo.get('second')).toBe(false);
      expect(bo.get('third')).toBe(false);
      expect(bo.get('fourth')).toBe(false);
    });

    it('sets single options correctly', () => {
      bo.set('first', true);
      bo.set('third', true);
      bo.set('fourth', true);
      expect(bo.toNumber()).toBe(13);
    });

    it('throws on getting/setting unknown option', () => {
      bo.read(3);
      expect(() => bo.get('fifth')).toThrowError(ERROR_REGEX);
      expect(() => bo.set('fifth', true)).toThrowError(ERROR_REGEX);
    });

    it('throws on too many options or large input', () => {
      const MAX_VALUE = Math.pow(2, 32) - 1;
      const OPTIONS_31 = [
        {name: '1'},
        {name: '2'},
        {name: '3'},
        {name: '4'},
        {name: '5'},
        {name: '6'},
        {name: '7'},
        {name: '8'},
        {name: '9'},
        {name: '10'},
        {name: '11'},
        {name: '12'},
        {name: '13'},
        {name: '14'},
        {name: '15'},
        {name: '16'},
        {name: '17'},
        {name: '18'},
        {name: '19'},
        {name: '20'},
        {name: '21'},
        {name: '22'},
        {name: '23'},
        {name: '24'},
        {name: '25'},
        {name: '26'},
        {name: '27'},
        {name: '28'},
        {name: '29'},
        {name: '30'},
        {name: '31'},
      ];

      expect(() => new BitwiseOptions(OPTIONS_31)).not.toThrowError(ERROR_REGEX);
      expect(() => new BitwiseOptions(OPTIONS_31.concat({name: '32'}))).toThrowError(ERROR_REGEX);

      const bo = new BitwiseOptions(OPTIONS_31);

      expect(() => bo.read(MAX_VALUE + 1)).toThrowError(ERROR_REGEX);

      bo.read(MAX_VALUE);
      expect(bo.get('31')).toBe(true);
      expect(bo.get('1')).toBe(true);
    });
  });

  describe('multi-bit options', () => {
    let bo: BitwiseOptions;

    beforeEach(() => {
      bo = new BitwiseOptions([
        {name: 'first_2bit', size: 2},
        {name: 'second_bool'},
        {name: 'third_5bit', size: 5},
        {name: 'fourth_4bit', size: 4},
      ]);
    });

    it('reads multi-bit options', () => {
      bo.read(2542); // 1001,11101,1,10 = 9,29,1,2
      expect(bo.get('first_2bit')).toBe(2);
      expect(bo.get('second_bool')).toBe(true);
      expect(bo.get('third_5bit')).toBe(29);
      expect(bo.get('fourth_4bit')).toBe(9);
    });

    it('reads single-bit as a number', () => {
      const bo = new BitwiseOptions([
        {name: 'first', type: 'bool'},
        {name: 'second', type: 'uint'},
        {name: 'third', type: 'uint'},
      ]);
      bo.read(5);
      expect(bo.get('first')).toBe(true);
      expect(bo.get('second')).toBe(0);
      expect(bo.get('third')).toBe(1);
    });

    it('sets multi-bit options correctly', () => {
      bo.set('first_2bit', 0);
      bo.set('second_bool', true);
      bo.set('third_5bit', 31);
      expect(bo.toNumber()).toBe(252);
    });

    it('throws on signed ints', () => {
      expect(() => bo.set('third_5bit', -3)).toThrowError(ERROR_REGEX);
    });

    it('throws if option value is incorrect', () => {
      expect(() => bo.set('fourth_4bit', 16)).toThrowError(ERROR_REGEX);
      expect(() => bo.set('second_bool', 1)).toThrowError(ERROR_REGEX);
    });

    it('ignores unknown options in input', () => {
      bo.read(30851); // 111,1000,10000,0,11
      expect(bo.get('first_2bit')).toBe(3);
      expect(bo.get('second_bool')).toBe(false);
      expect(bo.get('third_5bit')).toBe(16);
      expect(bo.get('fourth_4bit')).toBe(8);
    });

    it('throws on getting/setting unknown option', () => {
      bo.read(0);
      expect(() => bo.set('no one', 0)).toThrowError(ERROR_REGEX);
      expect(() => bo.set('hello', 0)).toThrowError(ERROR_REGEX);
    });

    it('throws on too many bits or large input', () => {
      const MAX_VALUE = Math.pow(2, 32) - 1;
      const OPTIONS = [
        {name: '1', size: 25},
        {name: '2', size: 5},
      ];

      expect(() => new BitwiseOptions(OPTIONS)).not.toThrowError(ERROR_REGEX);
      expect(() => new BitwiseOptions(OPTIONS.concat({name: '3', size: 1}))).not.toThrowError(ERROR_REGEX);
      expect(() => new BitwiseOptions(OPTIONS.concat({name: '3', size: 2}))).toThrowError(ERROR_REGEX);

      const bo = new BitwiseOptions(OPTIONS);

      expect(() => bo.read(MAX_VALUE + 1)).toThrowError(ERROR_REGEX);

      bo.read(MAX_VALUE);
      expect(bo.get('1')).toBe(33554431);
      expect(bo.get('2')).toBe(31);
    });
  });
});
