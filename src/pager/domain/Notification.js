class Notification {
  constructor({ notificationId, notificationTarget, notificationAlert }) {
    this.id = notificationId;
    this.target = notificationTarget;
    this.alert = notificationAlert;
  }

  getId() {
    return this.id;
  }
}

module.exports = Notification;
