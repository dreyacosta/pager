class NotificationAckTimeout {
  static fromTarget({ notificationTarget }) {
    return new NotificationAckTimeout({
      notificationAckTimeoutTargetId: notificationTarget.getId(),
    });
  }

  constructor({ notificationAckTimeoutTargetId, notificationAckTimeoutTime }) {
    this.targetId = notificationAckTimeoutTargetId;
    this.timeout = notificationAckTimeoutTime || NotificationAckTimeout.TIMEOUT;
  }

  getTargetId() {
    return this.targetId;
  }

  getTimeout() {
    return this.timeout;
  }
}

NotificationAckTimeout.TIMEOUT = 15;

module.exports = NotificationAckTimeout;
