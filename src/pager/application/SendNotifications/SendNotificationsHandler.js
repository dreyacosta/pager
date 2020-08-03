class SendNotificationsHandler {
  constructor({ sendNotifications }) {
    this.sendNotifications = sendNotifications;
  }

  async execute() {
    await this.sendNotifications.execute();
  }
}

module.exports = SendNotificationsHandler;
