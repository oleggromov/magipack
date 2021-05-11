import BitwiseOptions from './index';

describe('BitwiseOptions', () => {
  it('test', () => {
    const bo = new BitwiseOptions([]);
    expect(bo.has()).toBe(true);
  });
});
