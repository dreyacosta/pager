const MonitoredService = require('../../../../src/pager/domain/MonitoredService');
const MonitoredServiceInMemoryRepository = require('../../../../src/pager/infrastructure/MonitoredServiceInMemoryRepository');
const NotificationInMemoryRepository = require('../../../../src/pager/infrastructure/NotificationInMemoryRepository');
const Alert = require('../../../../src/pager/domain/Alert');
const Notification = require('../../../../src/pager/domain/Notification');
const EscalationPolicyTarget = require('../../../../src/pager/domain/EscalationPolicyTarget');
const HealService = require('../../../../src/pager/application/HealService/HealService');
const HealServiceHandler = require('../../../../src/pager/application/HealService/HealServiceHandler');
const HealServiceDTO = require('../../../../src/pager/application/HealService/HealServiceDTO');

describe('HealServiceHandler', () => {
  describe('given a unhealthy monitored service and notifications for that service', () => {
    let monitoredServiceRepository;
    let notificationRepository;
    let anotherServiceNotification;
    let serviceId;

    beforeEach(async () => {
      serviceId = 9;
      const monitoredServiceAlert = new Alert({
        serviceId,
        alertMessage: 'Network issues',
        alertOccurredOn: Date.now(),
      });
      const monitoredService = new MonitoredService({
        serviceId,
        escalationPolicyId: 11,
        monitoredServiceAlert,
        status: MonitoredService.STATUS.UNHEALTHY,
      });
      monitoredServiceRepository = new MonitoredServiceInMemoryRepository();
      await monitoredServiceRepository.save({ monitoredService });

      const anotherServiceAlert = new Alert({
        serviceId: 17,
        alertMessage: 'Server down',
        alertOccurredOn: Date.now(),
      });
      anotherServiceNotification = new Notification({
        notificationId: 'an_id_1',
        notificationTarget: new EscalationPolicyTarget({
          targetId: 21,
          targetType: EscalationPolicyTarget.TYPE.EMAIL,
          targetDestination: 'someone@company.com',
        }),
        notificationAlert: anotherServiceAlert,
      });
      const serviceNotification = new Notification({
        notificationId: 'an_id_2',
        notificationTarget: new EscalationPolicyTarget({
          targetId: 33,
          targetType: EscalationPolicyTarget.TYPE.EMAIL,
          targetDestination: 'mike@company.com',
        }),
        notificationAlert: monitoredServiceAlert,
      });
      const notifications = [
        anotherServiceNotification,
        serviceNotification,
      ];
      notificationRepository = new NotificationInMemoryRepository();
      await notificationRepository.saveAll({ notifications });
    });

    describe('when receive healthy event for that service', () => {
      it('then monitored service become healthy and delete notifications for that service', async () => {
        const healService = new HealService({
          monitoredServiceRepository,
          notificationRepository,
        });
        const handler = new HealServiceHandler({
          healService,
        });

        const healServiceDTO = HealServiceDTO.create({
          serviceId,
        });
        await handler.execute({ healServiceDTO });

        const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
        const notifications = await notificationRepository.findNotProcessed();
        expect(monitoredServiceUpdated.getStatus()).toEqual(MonitoredService.STATUS.HEALTHY);
        expect(notifications).toEqual([anotherServiceNotification]);
      });
    });
  });
});
