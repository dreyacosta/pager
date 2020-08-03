const NotificationSmsSender = require('../domain/NotificationSmsSender');

class NotificationSmsHttpSender extends NotificationSmsSender {
  static createNull() {
    return new NotificationSmsHttpSender({
      notificationSmsHttpClient: new NullNotificationSmsHttpClient(),
    });
  }

  constructor({ notificationSmsHttpClient }) {
    super();

    this.httpClient = notificationSmsHttpClient;
  }

  async send({ notificationSms }) {
    await this.httpClient.sendSms({
      phoneNumber: notificationSms.getPhoneNumber(),
      text: notificationSms.getText(),
    });
  }
}

class NullNotificationSmsHttpClient {
  constructor() {
    this.sent = [];
  }

  async sendSms(smsData) {
    this.sent.push(smsData);
  }
}

module.exports = NotificationSmsHttpSender;
