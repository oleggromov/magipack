import BitwiseOptions from './index';

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
    })

    it('reads single options', () => {
      bo.read(13);
      expect(bo.get('first')).toBe(true);
      expect(bo.get('second')).toBe(false);
      expect(bo.get('third')).toBe(true);
      expect(bo.get('fourth')).toBe(true);
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
      expect(() => bo.get('fifth')).toThrow();
      expect(() => bo.set('fifth', true)).toThrow();
    });

    it('throws on too many options or large input', () => {
      const MAX_VALUE = Math.pow(2, 32) - 1;

      expect(() => new BitwiseOptions(OPTIONS_31)).not.toThrow();
      expect(() => new BitwiseOptions(OPTIONS_31.concat({name: '32'}))).toThrow();

      const bo = new BitwiseOptions(OPTIONS_31);

      expect(() => bo.read(MAX_VALUE + 1)).toThrow();

      bo.read(MAX_VALUE);
      expect(bo.get('31')).toBe(true);
      expect(bo.get('1')).toBe(true);
    });
  });
});

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
]
