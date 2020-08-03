class Notification {
  constructor({ notificationId, notificationTarget, notificationAlert, notificationProcessedOn }) {
    this.id = notificationId;
    this.target = notificationTarget;
    this.alert = notificationAlert;
    this.processedOn = notificationProcessedOn || null;
  }

  isProcessed() {
    return !!this.processedOn;
  }

  isTargetEmail() {
    return this.target.isEmail();
  }

  isTargetSms() {
    return this.target.isSms();
  }

  processed() {
    this.processedOn = Date.now();
  }

  getId() {
    return this.id;
  }

  getProcessedOn() {
    return this.processedOn;
  }

  getTarget() {
    return this.target;
  }

  getAlert() {
    return this.alert;
  }

  getTargetDestination() {
    return this.target.getDestination();
  }

  getAlertMessage() {
    return this.alert.getMessage();
  }
}

module.exports = Notification;
