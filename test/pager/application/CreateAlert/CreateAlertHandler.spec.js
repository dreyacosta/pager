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
    const escalationPolicyId = 8;
    const monitoredServiceRepository = new MonitoredServiceInMemoryRepository();
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
      escalationPolicyId,
      escalationPolicyLevels: [
        new EscalationPolicyLevel({
          escalationPolicyLevelTargets: [
            targetOne,
            targetTwo,
          ],
        }),
      ],
    });

    const alertDTO = AlertDTO.create({
      serviceId,
      alertMessage: 'Network error',
      alertOccurredOn: Date.now(),
    });
    const createAlert = new CreateAlert({
      monitoredServiceRepository,
      escalationPolicyRepository,
      notificationRepository,
    });
    const handler = new CreateAlertHandler({
      createAlert,
    });

    beforeEach(async () => {
      const monitoredService = new MonitoredService({
        serviceId,
        escalationPolicyId,
      });
      await monitoredServiceRepository.save({ monitoredService });
      await escalationPolicyRepository.save({ escalationPolicy });
    });

    describe('when CreateAlertHandler receives new alert related to the service', () => {
      it('then the monitored service becomes unhealthy', async () => {
        await handler.execute({ alertDTO });

        const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
        expect(monitoredServiceUpdated.getStatus()).toEqual(MonitoredService.STATUS.UNHEALTHY);
      });

      it('then creates notifications for the first level of the escalation policy', async () => {
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
