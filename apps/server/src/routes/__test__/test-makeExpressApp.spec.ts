import { makeExpressApp } from '../../lib/app-lib';

test('makeExpressApp should return an instance of Express app', () => {
  const app = makeExpressApp();
  expect(app).toBeDefined();
});
