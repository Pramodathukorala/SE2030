const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const TransactionSubject = require('../patterns/observer/TransactionSubject');
const TransactionObserver = require('../patterns/observer/TransactionObserver');
const NotificationObserver = require('../patterns/observer/NotificationObserver');
const subject = require('../patterns/observer');
const { transferFunds, getMyTransactions, getTransactionByReference } = require('../controllers/transactionController');

function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

function transferSetup(t, options = {}) {
  const events = [];
  const sender = { _id: 'sender', user: 'customer', accountNumber: 'ACC1', balance: 100, status: 'ACTIVE', async save() { events.push('sender saved'); } };
  const receiver = { _id: 'receiver', user: 'recipient', accountNumber: 'ACC2', balance: 50, status: 'ACTIVE', async save() { events.push('receiver saved'); } };
  t.mock.method(mongoose, 'startSession', async () => ({
    startTransaction() {}, endSession() {},
    async abortTransaction() { events.push('abort'); },
    async commitTransaction() {
      if (options.commitFailure) throw new Error('Commit failed');
      events.push('commit');
    }
  }));
  t.mock.method(Account, 'findOne', query => ({ session: async () => query.user ? sender : options.invalidReceiver ? null : receiver }));
  t.mock.method(Transaction, 'findOne', () => ({ sort: async () => null }));
  const create = t.mock.method(Transaction, 'create', async ([data]) => [{ ...data, async save() { events.push(this.status); } }]);
  const notifications = [];
  t.mock.method(Notification, 'create', async ([data], ...args) => {
    assert.ok(events.includes('commit'), 'notification must follow commit');
    assert.equal(args.length, 0, 'notification must not use the ended session');
    notifications.push(data);
    if (options.notificationFailure && data.user === sender.user) throw new Error('Notification unavailable');
  });
  const errors = t.mock.method(console, 'error', () => {});
  return { sender, receiver, events, notifications, errors, create, async run(amount = 10) {
    const res = response();
    await transferFunds({ user: { _id: sender.user }, body: { receiverAccountNumber: 'ACC2', amount } }, res);
    return res;
  } };
}

test('subject registers, deduplicates, awaits, and removes observers', async () => {
  const local = new TransactionSubject();
  const calls = [];
  const observer = { async update(transaction, userId) { await Promise.resolve(); calls.push([transaction, userId]); } };
  local.addObserver(observer);
  local.addObserver(observer);
  const transaction = { status: 'SUCCESSFUL' };
  await local.notifyObservers(transaction, 'customer');
  assert.deepEqual(calls, [[transaction, 'customer']]);
  local.removeObserver(observer);
  await local.notifyObservers(transaction, 'customer');
  assert.equal(calls.length, 1);
  await assert.rejects(new TransactionObserver().update(transaction, 'customer'), /must be implemented/);
  assert.equal(subject.observers.length, 1);
  assert.ok(subject.observers[0] instanceof NotificationObserver);
});

test('successful transfer saves balances and notifies both customers after commit', async t => {
  const setup = transferSetup(t);
  const res = await setup.run();
  assert.equal(res.code, 200);
  assert.equal(res.body.data.status, 'SUCCESSFUL');
  assert.equal(res.body.data.senderAccount, 'sender');
  assert.equal(setup.sender.balance, 90);
  assert.equal(setup.receiver.balance, 60);
  assert.deepEqual(setup.events, ['sender saved', 'receiver saved', 'SUCCESSFUL', 'commit']);
  assert.deepEqual(setup.notifications, [
    { user: 'customer', title: 'Transfer Successful', message: 'You have successfully transferred Rs. 10.00 to account ACC2', type: 'TRANSACTION' },
    { user: 'recipient', title: 'Funds Received', message: 'You have received Rs. 10.00 from account ACC1', type: 'TRANSACTION' }
  ]);
});

test('invalid receiver creates no transaction or notification', async t => {
  const setup = transferSetup(t, { invalidReceiver: true });
  const res = await setup.run();
  assert.equal(res.code, 404);
  assert.equal(res.body.message, 'Receiver account not found');
  assert.equal(setup.create.mock.callCount(), 0);
  assert.deepEqual(setup.notifications, []);
  assert.equal(setup.sender.balance, 100);
  assert.equal(setup.receiver.balance, 50);
});

test('insufficient balance preserves rejection without storing FAILED transactions', async t => {
  const setup = transferSetup(t);
  const res = await setup.run(101);
  assert.equal(res.code, 400);
  assert.equal(res.body.message, 'Insufficient balance');
  assert.equal(setup.create.mock.callCount(), 0);
  assert.deepEqual(setup.notifications, []);
  assert.equal(setup.sender.balance, 100);
  assert.equal(setup.receiver.balance, 50);
});

test('notification failure preserves successful transfer and still notifies receiver', async t => {
  const setup = transferSetup(t, { notificationFailure: true });
  const res = await setup.run();
  assert.equal(res.code, 200);
  assert.equal(res.body.data.status, 'SUCCESSFUL');
  assert.equal(setup.sender.balance, 90);
  assert.equal(setup.receiver.balance, 60);
  assert.equal(setup.events.includes('abort'), false);
  assert.equal(setup.errors.mock.callCount(), 1);
  assert.equal(setup.notifications.length, 2);
});

test('commit failure never emits a success notification', async t => {
  const setup = transferSetup(t, { commitFailure: true });
  assert.equal((await setup.run()).code, 500);
  assert.deepEqual(setup.notifications, []);
  assert.ok(setup.events.includes('abort'));
});

test('observer supports persisted FAILED and PENDING states', async t => {
  const notifications = [];
  t.mock.method(Notification, 'create', async ([data]) => notifications.push(data));
  const observer = new NotificationObserver();
  for (const status of ['FAILED', 'PENDING']) {
    await observer.update({ status, referenceNumber: 'TXN-TEST' }, 'customer');
  }
  assert.deepEqual(notifications.map(item => item.title), ['Transfer Failed', 'Transaction Pending']);
  for (const item of notifications) {
    assert.equal(item.user, 'customer');
    assert.equal(item.type, 'TRANSACTION');
    assert.match(item.message, /TXN-TEST/);
  }
});

test('transaction history retains account ownership and status filters', async t => {
  const data = [{ referenceNumber: 'TXN-TEST' }];
  t.mock.method(Account, 'findOne', async () => ({ _id: 'sender' }));
  t.mock.method(Transaction, 'find', query => {
    assert.deepEqual(query, { $or: [{ senderAccount: 'sender' }, { receiverAccount: 'sender' }], status: 'SUCCESSFUL' });
    const chain = { populate() { return this; }, async sort() { return data; } };
    return chain;
  });
  const res = response();
  await getMyTransactions({ user: { _id: 'customer' }, query: { status: 'SUCCESSFUL' } }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body.data, data);
});

test('reference search returns owner transaction and rejects another customer', async t => {
  const data = { referenceNumber: 'TXN-TEST', senderAccount: { user: 'customer' }, receiverAccount: { user: 'recipient' } };
  t.mock.method(Transaction, 'findOne', query => {
    assert.deepEqual(query, { referenceNumber: 'TXN-TEST' });
    return { populate() { return { populate: async () => data }; } };
  });
  for (const [userId, code] of [['customer', 200], ['recipient', 200], ['other', 403]]) {
    const res = response();
    await getTransactionByReference({ user: { _id: userId, role: 'CUSTOMER' }, params: { referenceNumber: 'TXN-TEST' } }, res);
    assert.equal(res.code, code);
    if (code === 200) assert.deepEqual(res.body.data, data);
  }
});
