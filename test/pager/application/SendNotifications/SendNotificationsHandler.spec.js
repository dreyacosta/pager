const EscalationPolicyTarget = require('../../../../src/pager/domain/EscalationPolicyTarget');
const Alert = require('../../../../src/pager/domain/Alert');
const Notification = require('../../../../src/pager/domain/Notification');
const NotificationInMemoryRepository = require('../../../../src/pager/infrastructure/NotificationInMemoryRepository');
const SendNotifications = require('../../../../src/pager/application/SendNotifications/SendNotifications');
const SendNotificationsHandler = require('../../../../src/pager/application/SendNotifications/SendNotificationsHandler');
const NotificationSmsHttpSender = require('../../../../src/pager/infrastructure/NotificationSmsHttpSender');
const NotificationEmailHttpSender = require('../../../../src/pager/infrastructure/NotificationEmailHttpSender');
const NotificationEmail = require('../../../../src/pager/domain/NotificationEmail');
const NotificationAckTimeoutHttpSetter = require('../../../../src/pager/infrastructure/NotificationAckTimeoutHttpSetter');
const NotificationAckTimeout = require('../../../../src/pager/domain/NotificationAckTimeout');

describe('SendNotificationsHandler', () => {
  describe('given a mail notification and an SMS notification for 2 different targets', () => {
    const targetEmail = new EscalationPolicyTarget({
      targetId: 1,
      targetType: EscalationPolicyTarget.TYPE.EMAIL,
      targetDestination: 'mike@company.com',
    });
    const targetSms = new EscalationPolicyTarget({
      targetId: 2,
      targetType: EscalationPolicyTarget.TYPE.SMS,
      targetDestination: '+12025550102',
    });
    const alert = new Alert({
      serviceId: 1,
      alertMessage: 'Network error',
      alertOccurredOn: Date.now(),
    });
    const notificationRepository = new NotificationInMemoryRepository();

    describe('when SendNotificacions', () => {
      let notificationEmailSender;
      let notificationSmsSender;
      let notificationAckTimeoutSetter;
      let handler;

      beforeEach(async () => {
        const mailNotification = new Notification({
          notificationId: `${targetEmail.getId()}_${alert.getOccurredOn()}`,
          notificationTarget: targetEmail,
          notificationAlert: alert,
        });
        const smsNotification = new Notification({
          notificationId: `${targetSms.getId()}_${alert.getOccurredOn()}`,
          notificationTarget: targetSms,
          notificationAlert: alert,
        });
        const notifications = [
          mailNotification,
          smsNotification,
        ];
        await notificationRepository.saveAll({ notifications });

        notificationEmailSender = NotificationEmailHttpSender.createNull();
        notificationSmsSender = NotificationSmsHttpSender.createNull();
        notificationAckTimeoutSetter = NotificationAckTimeoutHttpSetter.createNull();
        const sendNotifications = new SendNotifications({
          notificationRepository,
          notificationEmailSender,
          notificationSmsSender,
          notificationAckTimeoutSetter,
        });
        handler = new SendNotificationsHandler({
          sendNotifications,
        });
      });

      afterEach(async () => {
        await notificationRepository.drop();
      });

      it('then notifications are marked as proccessed', async () => {
        const timeBeforeHandler = Date.now();

        await handler.execute();

        const notificationsUpdated = await notificationRepository.findAll();
        notificationsUpdated.forEach((notification) => {
          expect(notification.getProcessedOn()).toBeGreaterThan(timeBeforeHandler);
        });
      });

      it('then notifies targets by email and SMS', async () => {
        await handler.execute();

        expect(notificationEmailSender.httpClient.sent).toEqual([
          {
            from: NotificationEmail.FROM,
            to: targetEmail.getDestination(),
            subject: alert.getMessage(),
            body: alert.getMessage(),
          },
        ]);
        expect(notificationSmsSender.httpClient.sent).toEqual([
          {
            phoneNumber: targetSms.getDestination(),
            text: alert.getMessage(),
          },
        ]);
      });

      it('then set 15 min acknowledgement timeout for each target', async () => {
        await handler.execute();

        expect(notificationAckTimeoutSetter.httpClient.timers).toEqual([
          {
            targetId: targetEmail.getId(),
            ackTimeout: NotificationAckTimeout.TIMEOUT,
          },
          {
            targetId: targetSms.getId(),
            ackTimeout: NotificationAckTimeout.TIMEOUT,
          },
        ]);
      });
    });
  });
});
