class NotificationEmailSender {
  static create() {
    throw new Error('create is not implemented');
  }

  static createNull() {
    throw new Error('createNull is not implemented');
  }

  async send() {
    throw new Error('send is not implemented');
  }
}

module.exports = NotificationEmailSender;
