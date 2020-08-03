const NotificationEmail = require('../../domain/NotificationEmail');
const NotificationSms = require('../../domain/NotificationSms');

class SendNotifications {
  constructor({ notificationRepository, notificationEmailSender, notificationSmsSender }) {
    this.notificationRepository = notificationRepository;
    this.notificationEmailSender = notificationEmailSender;
    this.notificationSmsSender = notificationSmsSender;
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

      notification.processed();
    }

    await this.notificationRepository.saveAll({ notifications });
  }
}

module.exports = SendNotifications;
