class NotificationSms {
  static fromNotification({ notification }) {
    return new NotificationSms({
      notificationSmsPhoneNumber: notification.getTargetDestination(),
      notificationSmsText: notification.getAlertMessage(),
    });
  }

  constructor({ notificationSmsPhoneNumber, notificationSmsText }) {
    this.phoneNumber = notificationSmsPhoneNumber;
    this.text = notificationSmsText;
  }

  getPhoneNumber() {
    return this.phoneNumber;
  }

  getText() {
    return this.text;
  }
}

module.exports = NotificationSms;
