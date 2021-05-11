export default class BitwiseOptions {
  test: boolean;

  constructor(test = false) {
    this.test = test;
  }

  isTest(): boolean {
    return this.test;
  }
}
