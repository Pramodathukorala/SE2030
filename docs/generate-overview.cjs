const fs = require('node:fs');
const path = require('node:path');

// Dependency-free, selectable-text A4 PDF using standard PDF fonts.
const pages = [];
let commands = [];
let y = 780;
const escape = text => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
function text(value, size = 11, bold = false, x = 48, color = '0.16 0.20 0.25') {
  commands.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm (${escape(value)}) Tj ET`);
}
function paragraph(value, size = 11) {
  const max = Math.floor(490 / (size * 0.53));
  let line = '';
  for (const word of value.split(' ')) {
    if ((line + ' ' + word).length > max) { text(line, size); y -= 16; line = ''; }
    line += (line ? ' ' : '') + word;
  }
  if (line) { text(line, size); y -= 16; }
  y -= 9;
}
function heading(value) { y -= 8; text(value, 15, true, 48, '0.04 0.24 0.38'); y -= 25; }
function page(title, subtitle) {
  commands = []; y = 780;
  text('WEB-BASED BANKING SYSTEM', 10, true, 48, '0.09 0.42 0.53'); y -= 35;
  text(title, 25, true, 48, '0.04 0.24 0.38'); y -= 25;
  text(subtitle, 10); y -= 20;
  commands.push(`0.95 0.64 0.38 RG 2 w 48 ${y} m 547 ${y} l S`); y -= 28;
}
function finish() {
  if (y < 65) throw new Error('Page content exceeds printable area');
  y = 35; text('SE2030 | Academic project overview', 9, false);
  text(`${pages.length + 1} / 3`, 9, false, 520);
  pages.push(commands.join('\n'));
}

page('Project Overview', 'MERN stack | Banking simulation | Four user roles');
paragraph('Student: Athukorala A A C P    |    Student ID: IT22139962', 10);
heading('Purpose');
paragraph('This full-stack web application simulates everyday banking operations, customer support, and user administration. Customers manage demo accounts, transfer simulated funds, track transactions, and submit complaints. It is an academic demonstration and does not connect to real banking networks or move real money.');
heading('Users and responsibilities');
paragraph('Customer: Register and sign in, view balances, transfer funds, search transaction history, submit complaints to a selected admin, and read notifications.');
paragraph('Customer Service Officer: Work with assigned complaints, update statuses, add staff notes, and escalate complex issues.');
paragraph('Bank Manager: Review escalated complaints, add manager notes, and view complaint reports and statistics.');
paragraph('System Admin: Manage users and staff, change roles and account access, delete users, and view or delete complaints assigned to their account.');
heading('Main modules');
paragraph('Authentication and role access; account information; fund transfers and transaction tracking; complaint handling; notifications; and system administration.');
heading('Recent additions');
paragraph('Complaint submission includes an active-admin dropdown. The selected admin sees the complaint on their dashboard and can delete it after confirmation. Admins can also delete users through the user details page; self-deletion is blocked.');
finish();

page('Architecture & Data', 'How the frontend, backend, and database work together');
heading('Technology stack');
paragraph('Frontend: React and Vite build the interface. React Router handles navigation, Bootstrap provides UI styling, Axios sends API requests, and Context API shares authentication state.');
paragraph('Backend: Node.js and Express provide REST APIs. JWT identifies signed-in users, bcryptjs hashes passwords, and express-validator checks registration inputs.');
paragraph('Database: MongoDB stores application data. Mongoose defines schemas, relationships, and field validation.');
heading('Request flow');
paragraph('React page -> Axios request -> Express route -> Authentication and role checks -> Controller -> Mongoose model -> MongoDB');
paragraph('The backend returns a JSON response. The frontend uses that response to update the screen or show a success or error message.');
heading('Five core data models');
paragraph('User: Names, email, password hash, role, and active/inactive status.');
paragraph('Account: Account number, owner, account type, balance, and status.');
paragraph('Transaction: Sender and receiver accounts, amount, reference number, status, description, and timestamps.');
paragraph('Complaint: Customer, title, description, category, assigned admin/officer, status, staff/manager notes, and lifecycle timestamps.');
paragraph('Notification: Recipient, title, message, notification type, read status, and timestamps.');
heading('Relationships');
paragraph('Accounts reference users. Each transfer references two accounts. Complaints reference a customer and assigned staff. Notifications reference the user who receives them.');
finish();

page('Structure & Workflows', 'A guide to the code and the main user journeys');
heading('Frontend folders');
paragraph('client/src/pages/: Screens grouped by customer, officer, manager, admin, and authentication. components/: Shared layouts and UI. context/: Authentication state. services/api.js: API calls. App.jsx: Page routes and role restrictions.', 10);
heading('Backend folders');
paragraph('server/routes/: API endpoints. controllers/: Business logic. models/: Database schemas. middleware/: Authentication, roles, and errors. utils/: Currency and identifier helpers. tests/: Backend tests. seed/: Demo data. server.js: Server startup and database connection.', 10);
heading('Fund transfer workflow');
paragraph('1. Customer enters the receiver account and transfer amount.\n'.trim(), 10);
paragraph('2. Backend checks identity, account status, amount precision, and available balance.', 10);
paragraph('3. A database transaction updates both balances and records the transfer together. Notifications are created and the result is returned to the customer.', 10);
heading('Complaint workflow');
paragraph('A customer selects an active admin and submits a complaint. The backend validates the selection, saves the assignment, and marks the complaint ASSIGNED. It appears in that admin\'s dashboard. Separate officer and manager screens support handling and escalation.', 10);
paragraph('Supported statuses: OPEN, ASSIGNED, IN_PROGRESS, ESCALATED, RESOLVED, and CLOSED.', 10);
heading('User deletion behavior');
paragraph('An admin confirms deletion from the user details page. Linked bank accounts become inactive while banking history is retained. Admin complaints assigned to the deleted user transfer to the deleting admin. These changes run in one database transaction.', 10);
heading('Presentation summary');
paragraph('My project is a MERN-based banking simulation with four user roles. It combines account management, fund transfers, transaction tracking, complaint handling, and administration using authentication, role checks, validation, and database transactions.', 10);
finish();

const objects = [null];
const add = value => { objects.push(value); return objects.length - 1; };
const catalog = add('');
const tree = add('');
const regular = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
const bold = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
const children = pages.map(content => {
  const stream = add(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
  return add(`<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> >> /Contents ${stream} 0 R >>`);
});
objects[catalog] = `<< /Type /Catalog /Pages ${tree} 0 R >>`;
objects[tree] = `<< /Type /Pages /Kids [${children.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
let output = '%PDF-1.4\n';
const offsets = [0];
for (let i = 1; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(output));
  output += `${i} 0 obj\n${objects[i]}\nendobj\n`;
}
const start = Buffer.byteLength(output);
output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
for (const offset of offsets.slice(1)) output += `${String(offset).padStart(10, '0')} 00000 n \n`;
output += `trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R >>\nstartxref\n${start}\n%%EOF\n`;
const target = path.join(__dirname, 'Project-Overview.pdf');
fs.writeFileSync(target, output);
console.log(`Created ${target} (${pages.length} pages, ${Buffer.byteLength(output)} bytes)`);
