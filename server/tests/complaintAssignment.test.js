const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { createComplaint, getComplaintAdmins } = require('../controllers/complaintController');
const { getAdminDashboard } = require('../controllers/dashboardController');

const adminId = '507f1f77bcf86cd799439011';
const customerId = '507f1f77bcf86cd799439012';
function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

test('missing or malformed admin selections are rejected', async () => {
  for (const assignedAdmin of [undefined, '', 'invalid', { role: 'SYSTEM_ADMIN' }]) {
    const res = response();
    await createComplaint({ body: { title: 'Issue', description: 'Details', assignedAdmin } }, res);
    assert.equal(res.code, 400);
  }
});

test('inactive or non-admin selections are rejected', async () => {
  const lookup = mock.method(User, 'findOne', async query => {
    assert.deepEqual(query, { _id: adminId, role: 'SYSTEM_ADMIN', status: 'ACTIVE' });
    return null;
  });
  try {
    const res = response();
    await createComplaint({ body: { title: 'Issue', description: 'Details', assignedAdmin: adminId } }, res);
    assert.equal(res.code, 400);
  } finally { lookup.mock.restore(); }
});

test('admin dropdown exposes only active admins and their names', async () => {
  const lookup = mock.method(User, 'find', query => {
    assert.deepEqual(query, { role: 'SYSTEM_ADMIN', status: 'ACTIVE' });
    return { select(fields) {
      assert.equal(fields, 'firstName lastName');
      return { sort: async () => [{ _id: adminId, firstName: 'Admin', lastName: 'One' }] };
    } };
  });
  try {
    const res = response();
    await getComplaintAdmins({}, res);
    assert.equal(res.body.data[0]._id, adminId);
  } finally { lookup.mock.restore(); }
});

test('submission saves the selected admin and assigned status', async () => {
  const mocks = [
    mock.method(User, 'findOne', async () => ({ _id: adminId })),
    mock.method(Complaint, 'findOne', () => ({ sort: async () => null })),
    mock.method(Complaint, 'create', async data => data),
    mock.method(Notification, 'create', async () => ({}))
  ];
  try {
    const res = response();
    await createComplaint({ user: { _id: customerId }, body: {
      title: 'Issue', description: 'Details', assignedAdmin: adminId
    } }, res);
    assert.equal(res.code, 201);
    assert.equal(res.body.data.assignedAdmin, adminId);
    assert.equal(res.body.data.customer, customerId);
    assert.equal(res.body.data.status, 'ASSIGNED');
  } finally { mocks.forEach(method => method.mock.restore()); }
});

test('admin dashboard filters complaints by the authenticated admin', async () => {
  const count = mock.method(User, 'countDocuments', async () => 0);
  const lookup = mock.method(Complaint, 'find', query => {
    assert.deepEqual(query, { assignedAdmin: adminId });
    return { populate: () => ({ sort: async () => [{ assignedAdmin: adminId, customer: customerId }] }) };
  });
  try {
    const res = response();
    await getAdminDashboard({ user: { _id: adminId } }, res);
    assert.equal(res.body.data.assignedComplaints.length, 1);
  } finally { count.mock.restore(); lookup.mock.restore(); }
});
