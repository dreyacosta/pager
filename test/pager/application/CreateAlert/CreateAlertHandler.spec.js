const MonitoredServiceInMemoryRepository = require('../../../../src/pager/infrastructure/MonitoredServiceInMemoryRepository');
const MonitoredService = require('../../../../src/pager/domain/MonitoredService');
const AlertDTO = require('../../../../src/pager/application/CreateAlert/AlertDTO');
const CreateAlertHandler = require('../../../../src/pager/application/CreateAlert/CreateAlertHandler');
const CreateAlert = require('../../../../src/pager/application/CreateAlert/CreateAlert');
const Alert = require('../../../../src/pager/domain/Alert');
const EscalationPolicyTarget = require('../../../../src/pager/domain/EscalationPolicyTarget');
const EscalationPolicyInMemoryRepository = require('../../../../src/pager/infrastructure/EscalationPolicyInMemoryRepository');
const EscalationPolicy = require('../../../../src/pager/domain/EscalationPolicy');
const EscalationPolicyLevel = require('../../../../src/pager/domain/EscalationPolicyLevel');
const NotificationInMemoryRepository = require('../../../../src/pager/infrastructure/NotificationInMemoryRepository');
const Notification = require('../../../../src/pager/domain/Notification');

describe('CreateAlertHandler', () => {
  describe('given a monitored service in a healthy state', () => {
    const serviceId = 3;
    const monitoredServiceRepository = new MonitoredServiceInMemoryRepository();
    const alertDTO = AlertDTO.create({
      alertId: 12,
      serviceId,
      alertMessage: 'Network error',
      alertOcurredOn: Date.now(),
    });
    const createAlert = new CreateAlert({
      monitoredServiceRepository,
    });
    const handler = new CreateAlertHandler({
      createAlert,
    });

    beforeEach(async () => {
      const monitoredService = new MonitoredService({
        serviceId,
      });
      await monitoredServiceRepository.save({ monitoredService });
    });

    describe('when CreateAlertHandler receives new alert related to the service', () => {
      it('then the monitored service becomes unhealthy', async () => {
        await handler.execute({ alertDTO });

        const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
        expect(monitoredServiceUpdated.getStatus()).toEqual(MonitoredService.STATUS.UNHEALTHY);
      });

      it('then creates notifications for the first level of the escalation policy', async () => {
        const escalationPolicyRepository = new EscalationPolicyInMemoryRepository();
        const notificationRepository = new NotificationInMemoryRepository();

        const targetOne = new EscalationPolicyTarget({
          targetId: 1,
          targetType: EscalationPolicyTarget.TYPE.EMAIL,
          targetDestination: 'mike@company.com',
        });
        const targetTwo = new EscalationPolicyTarget({
          targetId: 2,
          targetType: EscalationPolicyTarget.TYPE.SMS,
          targetDestination: '+12025550102',
        });
        const escalationPolicy = new EscalationPolicy({
          escalationPolicyId: 8,
          levels: [
            new EscalationPolicyLevel({
              targets: [
                targetOne,
                targetTwo,
              ],
            }),
          ],
        });
        await escalationPolicyRepository.save({ escalationPolicy });

        await handler.execute({ alertDTO });

        const alert = Alert.fromDTO({ alertDTO });
        const notifications = await notificationRepository.findAll();
        const notificationsExpected = [
          new Notification({
            notificationId: `${targetOne.getId()}_${alertDTO.getOccurredOn()}`,
            notificationTarget: targetOne,
            notificationAlert: alert,
          }),
          new Notification({
            notificationId: `${targetTwo.getId()}_${alertDTO.getOccurredOn()}`,
            notificationTarget: targetTwo,
            notificationAlert: alert,
          }),
        ];
        expect(notifications).toEqual(notificationsExpected);
      });
    });
  });
});
