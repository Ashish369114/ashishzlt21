const test = require('node:test');
const assert = require('node:assert/strict');
const roleMiddleware = require('../middleware/roleMiddleware');

test('allows teacher roles stored with mixed casing', () => {
  let called = false;
  const req = { user: { role: 'Teacher' } };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json() {},
  };

  const middleware = roleMiddleware(['teacher', 'super_admin', 'principal']);
  middleware(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(res.statusCode, undefined);
});
