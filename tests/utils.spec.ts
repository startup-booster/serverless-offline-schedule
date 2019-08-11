import childProcess from 'child_process';

import { convertExpressionToCron, slsInvokeFunction } from '../src/utils';

const rateFixtures = [
  {
    input: 'rate(1 minute)',
    result: '*/1 * * * *',
  },
  {
    input: 'rate(2 minute)',
    result: '*/2 * * * *',
  },
  {
    input: 'rate(1 hour)',
    result: '0 */1 * * *',
  },
  {
    input: 'rate(2 hour)',
    result: '0 */2 * * *',
  },
  {
    input: 'rate(1 day)',
    result: '0 0 */1 * *',
  },
  {
    input: 'rate(2 day)',
    result: '0 0 */2 * *',
  },
];

const cronFixtures = [
  {
    input: 'cron(0 12 * * ? *)',
    result: '0 12 * * ? *',
  },
];

describe('utils', () => {
  describe('Rate schedule parsing', () => {
    it('handles invalid formats', () => {
      expect(() => convertExpressionToCron('rate(1minute)')).toThrowError(
        "Invalid rate format: '1minute'"
      );

      expect(() => convertExpressionToCron('rate(minute)')).toThrowError(
        "Invalid rate format: 'minute'"
      );
    });

    rateFixtures.forEach(fixture => {
      it(`Handles ${fixture.input}`, () => {
        expect(convertExpressionToCron(fixture.input)).toBe(fixture.result);
      });
    });
  });

  describe('Cron schedule parsing', () => {
    it('handles invalid formats', () => {
      expect(() => convertExpressionToCron('cro(0 12 * * ? *)')).toThrowError(
        "Invalid schedule rate: 'cro(0 12 * * ? *)'"
      );
    });

    cronFixtures.forEach(fixture => {
      it(`Handles ${fixture.input}`, () => {
        expect(convertExpressionToCron(fixture.input)).toBe(fixture.result);
      });
    });
  });

  describe('Invoke function', () => {
    it('Calls serveless invoke with correct arguments', () => {
      const invoke = jest.spyOn(childProcess, 'execSync').mockImplementation(() => Buffer.from(''));
      slsInvokeFunction('testFunction', { foo: 'bar' });

      expect(invoke).toBeCalledWith(
        `serverless invoke local --function testFunction --data '{\"foo\":\"bar\"}'`,
        { cwd: './', stdio: 'inherit' }
      );
    });
  });
});
