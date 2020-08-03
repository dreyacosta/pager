class NotificationEmail {
  static fromNotification({ notification }) {
    return new NotificationEmail({
      notificationEmailTo: notification.getTargetDestination(),
      notificationEmailSubject: notification.getAlertMessage(),
      notificationEmailBody: notification.getAlertMessage(),
    });
  }

  constructor({ notificationEmailTo, notificationEmailSubject, notificationEmailBody }) {
    this.from = NotificationEmail.FROM;
    this.to = notificationEmailTo;
    this.subject = notificationEmailSubject;
    this.body = notificationEmailBody;
  }

  getFrom() {
    return this.from;
  }

  getTo() {
    return this.to;
  }

  getSubject() {
    return this.subject;
  }

  getBody() {
    return this.body;
  }
}

NotificationEmail.FROM = 'no-reply@company.com';

module.exports = NotificationEmail;
