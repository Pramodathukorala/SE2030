class TransactionObserver {
  async update(transaction, userId) {
    throw new Error('update() must be implemented');
  }
}

module.exports = TransactionObserver;
