class TransactionSubject {
  constructor() {
    this.observers = [];
  }

  addObserver(observer) {
    if (!this.observers.includes(observer)) this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(item => item !== observer);
  }

  async notifyObservers(transaction, userId) {
    for (const observer of this.observers) {
      await observer.update(transaction, userId);
    }
  }
}

module.exports = TransactionSubject;
