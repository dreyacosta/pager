const NotificationAckTimeoutSetter = require('../domain/NotificationAckTimeoutSetter');

class NotificationAckTimeoutHttpSetter extends NotificationAckTimeoutSetter {
  static createNull() {
    return new NotificationAckTimeoutHttpSetter({
      notificationAckTimeoutHttpClient: new NullNotificationAckTimeoutHttp(),
    });
  }

  constructor({ notificationAckTimeoutHttpClient }) {
    super();

    this.httpClient = notificationAckTimeoutHttpClient;
  }

  async setTimeout({ notificationAckTimeout }) {
    await this.httpClient.setTimeout({
      targetId: notificationAckTimeout.getTargetId(),
      ackTimeout: notificationAckTimeout.getTimeout(),
    });
  }
}

class NullNotificationAckTimeoutHttp {
  constructor() {
    this.timers = [];
  }

  async setTimeout(timeoutData) {
    this.timers.push(timeoutData);
  }
}

module.exports = NotificationAckTimeoutHttpSetter;
