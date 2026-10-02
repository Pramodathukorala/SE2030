const TransactionObserver = require('./TransactionObserver');
const Notification = require('../../models/Notification');
const { formatLKR } = require('../../utils/currency');

class NotificationObserver extends TransactionObserver {
  async update(transaction, userId) {
    let title;
    let message;

    switch (transaction.status) {
      case 'SUCCESSFUL': {
        const isReceiver = String(transaction.receiverAccount.user) === String(userId);
        title = isReceiver ? 'Funds Received' : 'Transfer Successful';
        message = isReceiver
          ? `You have received ${formatLKR(transaction.amount)} from account ${transaction.senderAccount.accountNumber}`
          : `You have successfully transferred ${formatLKR(transaction.amount)} to account ${transaction.receiverAccount.accountNumber}`;
        break;
      }
      case 'FAILED':
        title = 'Transfer Failed';
        message = `Transaction ${transaction.referenceNumber} failed.`;
        break;
      case 'PENDING':
        title = 'Transaction Pending';
        message = `Transaction ${transaction.referenceNumber} is pending.`;
        break;
      default:
        return;
    }

    await Notification.create([{ user: userId, title, message, type: 'TRANSACTION' }]);
  }
}

module.exports = NotificationObserver;
