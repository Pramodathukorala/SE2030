const TransactionSubject = require('./TransactionSubject');
const NotificationObserver = require('./NotificationObserver');

// CommonJS caches this configured subject, so registration happens once.
const transactionSubject = new TransactionSubject();
transactionSubject.addObserver(new NotificationObserver());

module.exports = transactionSubject;
