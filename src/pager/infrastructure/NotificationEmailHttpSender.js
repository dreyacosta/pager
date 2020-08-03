const NotificationEmailSender = require('../domain/NotificationEmailSender');

class NotificationEmailHttpSender extends NotificationEmailSender {
  static createNull() {
    return new NotificationEmailHttpSender({
      notificationEmailHttpClient: new NullNotificationEmailHttpClient(),
    });
  }

  constructor({ notificationEmailHttpClient }) {
    super();

    this.httpClient = notificationEmailHttpClient;
  }

  async send({ notificationEmail }) {
    await this.httpClient.sendEmail({
      from: notificationEmail.getFrom(),
      to: notificationEmail.getTo(),
      subject: notificationEmail.getSubject(),
      body: notificationEmail.getBody(),
    });
  }
}

class NullNotificationEmailHttpClient {
  constructor() {
    this.sent = [];
  }

  async sendEmail(emailData) {
    this.sent.push(emailData);
  }
}

module.exports = NotificationEmailHttpSender;
