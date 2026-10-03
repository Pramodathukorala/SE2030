const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const Complaint = require('../models/Complaint');
const { updateComplaint } = require('../controllers/complaintController');

const id = '507f1f77bcf86cd799439011';
const customer = '507f1f77bcf86cd799439012';
const validBody = { title: 'Updated title', description: 'Updated details', category: 'OTHER' };
const request = body => ({ params: { id }, user: { _id: customer }, body });
function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

test('editing is restricted to the owner and only changes customer fields', async () => {
  const lookup = mock.method(Complaint, 'findOneAndUpdate', async (filter, update, options) => {
    assert.deepEqual(filter, { _id: id, customer });
    assert.deepEqual(update, { $set: validBody });
    assert.deepEqual(options, { new: true, runValidators: true });
    return { _id: id, ...validBody, status: 'ASSIGNED' };
  });
  try {
    const res = response();
    await updateComplaint(request({ ...validBody, title: ' Updated title ', description: ' Updated details ',
      customer: 'another-customer', status: 'CLOSED', staffNotes: 'Injected', assignedAdmin: customer }), res);
    assert.equal(res.code, 200);
    assert.equal(res.body.data.status, 'ASSIGNED');
  } finally { lookup.mock.restore(); }
});

test('missing complaints and complaints owned by another customer cannot be edited', async () => {
  const lookup = mock.method(Complaint, 'findOneAndUpdate', async filter => {
    assert.equal(filter.customer, customer);
    return null;
  });
  try {
    const res = response();
    await updateComplaint(request(validBody), res);
    assert.equal(res.code, 404);
  } finally { lookup.mock.restore(); }
});

test('invalid IDs and invalid edit fields are rejected before updating', async () => {
  const lookup = mock.method(Complaint, 'findOneAndUpdate', async () => {
    assert.fail('Invalid requests must not reach the database');
  });
  try {
    const invalidId = request(validBody);
    invalidId.params.id = 'invalid';
    const requests = [invalidId, ...[
      { title: ' ' }, { title: {} }, { description: '' }, { description: null },
      { category: 'INVALID' }, { category: undefined }
    ].map(fields => request({ ...validBody, ...fields }))];
    for (const req of requests) {
      const res = response();
      await updateComplaint(req, res);
      assert.equal(res.code, 400);
    }
  } finally { lookup.mock.restore(); }
});
