class NotificationAckTimeoutSetter {
  static createNull() {
    throw new Error('createNull is not implemented');
  }

  async setTimeout() {
    throw new Error('setTimeout is not implemented');
  }
}

NotificationAckTimeoutSetter.TIMEOUT = 30;

module.exports = NotificationAckTimeoutSetter;
