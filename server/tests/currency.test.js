const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { toMinorUnits, formatLKR } = require('../utils/currency');

test('LKR amounts retain cents and reject invalid precision and unsafe values', () => {
  assert.equal(toMinorUnits('10.25'), 1025);
  assert.equal(toMinorUnits(0.29), 29);
  assert.equal(toMinorUnits('2000'), 200000);
  for (const value of [0, -1, '1.001', 'abc', '', null, true, {}, Infinity, Number.MAX_VALUE]) {
    assert.equal(toMinorUnits(value), null);
  }
  assert.equal(formatLKR(2000), 'Rs. 2,000.00');
});

test('new accounts start at Rs. 2,000 and explicit balances are preserved', () => {
  assert.equal(new Account().balance, 2000);
  assert.equal(new Account({ balance: 0 }).balance, 0);
  assert.equal(new Account({ balance: 100000 }).balance, 100000);
});

test('transfer validates amounts, conserves balances, and sends LKR notifications', async (t) => {
  const referencePath = require.resolve('../utils/generateTransactionReference');
  require(referencePath);
  t.mock.method(require.cache[referencePath], 'exports', async () => 'TXN-TEST');
  const { transferFunds } = require('../controllers/transactionController');
  let committed = false;
  t.mock.method(mongoose, 'startSession', async () => ({
    startTransaction() {}, async abortTransaction() {}, endSession() {},
    async commitTransaction() { committed = true; },
  }));
  const sender = { _id: 'sender', user: 'customer', accountNumber: 'ACC1', balance: 2000, status: 'ACTIVE', async save() {} };
  const receiver = { _id: 'receiver', user: 'recipient', accountNumber: 'ACC2', balance: 2000, status: 'ACTIVE', async save() {} };
  t.mock.method(Account, 'findOne', (query) => ({ session: async () => query.user ? sender : receiver }));
  t.mock.method(Transaction, 'create', async ([data]) => [{ ...data, async save() {} }]);
  const notifications = [];
  t.mock.method(Notification, 'create', async ([data]) => { notifications.push(data); });
  const call = async (amount) => {
    const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
    await transferFunds({ user: { _id: 'customer' }, body: { receiverAccountNumber: 'ACC2', amount } }, res);
    return res;
  };
  for (const amount of ['1.001', 'invalid', -1, 0, null]) {
    assert.equal((await call(amount)).code, 400);
    assert.equal(sender.balance, 2000);
    assert.equal(receiver.balance, 2000);
  }
  assert.equal((await call(2000.01)).body.message, 'Insufficient balance');
  const result = await call('10.29');
  assert.equal(result.code, 200);
  assert.equal(result.body.data.amount, 10.29);
  assert.equal(sender.balance, 1989.71);
  assert.equal(receiver.balance, 2010.29);
  assert.equal(sender.balance + receiver.balance, 4000);
  assert.equal(committed, true);
  assert.equal(notifications.length, 2);
  for (const notification of notifications) assert.match(notification.message, /Rs\. 10\.29/);
});
