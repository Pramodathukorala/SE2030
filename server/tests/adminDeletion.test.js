const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Complaint = require('../models/Complaint');
const { deleteComplaint } = require('../controllers/complaintController');
const { deleteUser } = require('../controllers/userController');
const admin = '507f1f77bcf86cd799439011';
const target = '507f1f77bcf86cd799439012';
const request = id => ({ params: { id }, user: { _id: admin } });
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; } });

test('deletion rejects malformed IDs and self-deletion', async () => {
  for (const [handler, id] of [[deleteComplaint, 'invalid'], [deleteUser, 'invalid'], [deleteUser, admin]]) {
    const res = response();
    await handler(request(id), res);
    assert.equal(res.code, 400);
  }
});

test('complaint deletion atomically checks admin ownership', async () => {
  for (const result of [null, { _id: target }]) {
    const method = mock.method(Complaint, 'findOneAndDelete', async filter => {
      assert.deepEqual(filter, { _id: target, assignedAdmin: admin });
      return result;
    });
    try {
      const res = response();
      await deleteComplaint(request(target), res);
      assert.equal(res.code, result ? 200 : 404);
    } finally { method.mock.restore(); }
  }
});

test('user deletion deactivates accounts and transfers admin complaints in one transaction', async () => {
  let ended = false;
  const session = { withTransaction: async callback => callback(), endSession: async () => { ended = true; } };
  const methods = [
    mock.method(mongoose, 'startSession', async () => session),
    mock.method(User, 'findOneAndDelete', async (filter, options) => {
      assert.deepEqual(filter, { _id: target });
      assert.equal(options.session, session);
      return { _id: target };
    }),
    mock.method(Account, 'updateMany', async (filter, update, options) => {
      assert.deepEqual(filter, { user: target });
      assert.deepEqual(update, { $set: { status: 'INACTIVE' } });
      assert.equal(options.session, session);
    }),
    mock.method(Complaint, 'updateMany', async (filter, update, options) => {
      assert.deepEqual(filter, { assignedAdmin: target });
      assert.deepEqual(update, { $set: { assignedAdmin: admin } });
      assert.equal(options.session, session);
    })
  ];
  try {
    const res = response();
    await deleteUser(request(target), res);
    assert.equal(res.code, 200);
    assert.equal(ended, true);
    assert.equal(methods[2].mock.callCount(), 1);
    assert.equal(methods[3].mock.callCount(), 1);
  } finally { methods.forEach(method => method.mock.restore()); }
});

test('missing users return 404 and database failures return 500 with session cleanup', async () => {
  for (const fail of [false, true]) {
    let ended = false;
    const session = { withTransaction: async callback => callback(), endSession: async () => { ended = true; } };
    const methods = [
      mock.method(mongoose, 'startSession', async () => session),
      mock.method(User, 'findOneAndDelete', async () => { if (fail) throw new Error('Database error'); return null; })
    ];
    try {
      const res = response();
      await deleteUser(request(target), res);
      assert.equal(res.code, fail ? 500 : 404);
      assert.equal(ended, true);
    } finally { methods.forEach(method => method.mock.restore()); }
  }
});
