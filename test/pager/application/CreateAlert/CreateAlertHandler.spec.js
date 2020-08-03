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
    let serviceId;
    let escalationPolicyId;
    let monitoredServiceRepository;
    let notificationRepository;
    let targetOne;
    let targetTwo;
    let handler;

    beforeEach(async () => {
      serviceId = 3;
      escalationPolicyId = 8;
      const monitoredService = new MonitoredService({
        serviceId,
        escalationPolicyId,
      });
      monitoredServiceRepository = new MonitoredServiceInMemoryRepository();
      await monitoredServiceRepository.save({ monitoredService });

      targetOne = new EscalationPolicyTarget({
        targetId: 1,
        targetType: EscalationPolicyTarget.TYPE.EMAIL,
        targetDestination: 'mike@company.com',
      });
      targetTwo = new EscalationPolicyTarget({
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
      const escalationPolicyRepository = new EscalationPolicyInMemoryRepository();
      await escalationPolicyRepository.save({ escalationPolicy });

      notificationRepository = new NotificationInMemoryRepository();
      const createAlert = new CreateAlert({
        monitoredServiceRepository,
        escalationPolicyRepository,
        notificationRepository,
      });
      handler = new CreateAlertHandler({
        createAlert,
      });
    });

    describe('when CreateAlertHandler receives new alert related to the service', () => {
      it('then the monitored service becomes unhealthy and set alert', async () => {
        const alertDTO = AlertDTO.create({
          serviceId,
          alertMessage: 'Network error',
          alertOccurredOn: Date.now(),
        });

        await handler.execute({ alertDTO });

        const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
        const alert = monitoredServiceUpdated.getAlert();
        expect(monitoredServiceUpdated.getStatus()).toEqual(MonitoredService.STATUS.UNHEALTHY);
        expect(alert.getEscalationLevel()).toEqual(1);
      });

      it('then creates notifications for the first level of the escalation policy', async () => {
        const alertDTO = AlertDTO.create({
          serviceId,
          alertMessage: 'Network error',
          alertOccurredOn: Date.now(),
        });

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

  describe('given a monitored service in an unhealthy state', () => {
    let serviceId;
    let monitoredServiceRepository;
    let notificationRepository;
    let alert;
    let handler;

    beforeEach(async () => {
      serviceId = 4;
      const escalationPolicyId = 12;
      const monitoredService = new MonitoredService({
        serviceId,
        escalationPolicyId,
        status: MonitoredService.STATUS.UNHEALTHY,
      });
      alert = new Alert({
        serviceId,
        alertEscalationLevel: 2,
        alertMessage: 'Server down',
        alertOcurredOn: Date.now(),
      });
      monitoredService.setAlert({ alert });
      monitoredServiceRepository = new MonitoredServiceInMemoryRepository();
      await monitoredServiceRepository.save({ monitoredService });

      notificationRepository = new NotificationInMemoryRepository();
      const escalationPolicyRepository = new EscalationPolicyInMemoryRepository();
      const createAlert = new CreateAlert({
        monitoredServiceRepository,
        escalationPolicyRepository,
        notificationRepository,
      });
      handler = new CreateAlertHandler({
        createAlert,
      });
    });

    describe('when CreateAlertHandler receives new alert related to the service', () => {
      it('then ignores the alert', async () => {
        const alertDTO = AlertDTO.create({
          serviceId,
          alertMessage: 'Network error',
          alertOccurredOn: Date.now(),
        });

        await handler.execute({ alertDTO });

        const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
        const notifications = await notificationRepository.findAll();
        expect(monitoredServiceUpdated.getStatus()).toEqual(MonitoredService.STATUS.UNHEALTHY);
        expect(monitoredServiceUpdated.getAlert()).toEqual(alert);
        expect(notifications).toEqual([]);
      });
    });
  });
});
