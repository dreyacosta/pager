const NotificationEmail = require('../../domain/NotificationEmail');
const NotificationSms = require('../../domain/NotificationSms');
const NotificationAckTimeout = require('../../domain/NotificationAckTimeout');

class SendNotifications {
  constructor({
    notificationRepository,
    notificationEmailSender,
    notificationSmsSender,
    notificationAckTimeoutSetter,
  }) {
    this.notificationRepository = notificationRepository;
    this.notificationEmailSender = notificationEmailSender;
    this.notificationSmsSender = notificationSmsSender;
    this.notificationAckTimeoutSetter = notificationAckTimeoutSetter;
  }

  async execute() {
    const notifications = await this.notificationRepository.findNotProcessed();

    for (const notification of notifications) {
      if (notification.isTargetEmail()) {
        const notificationEmail = NotificationEmail.fromNotification({ notification });
        await this.notificationEmailSender.send({ notificationEmail });
      }

      if (notification.isTargetSms()) {
        const notificationSms = NotificationSms.fromNotification({ notification });
        await this.notificationSmsSender.send({ notificationSms });
      }

      const notificationTarget = notification.getTarget();
      const notificationAckTimeout = NotificationAckTimeout.fromTarget({ notificationTarget });
      await this.notificationAckTimeoutSetter.setTimeout({ notificationAckTimeout });

      notification.processed();
    }

    await this.notificationRepository.saveAll({ notifications });
  }
}

module.exports = SendNotifications;
