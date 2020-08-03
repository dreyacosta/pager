const MonitoredService = require('../../../../src/pager/domain/MonitoredService');
const MonitoredServiceInMemoryRepository = require('../../../../src/pager/infrastructure/MonitoredServiceInMemoryRepository');
const NotificationInMemoryRepository = require('../../../../src/pager/infrastructure/NotificationInMemoryRepository');
const AckAlert = require('../../../../src/pager/application/AckAlert/AckAlert');
const AckAlertHandler = require('../../../../src/pager/application/AckAlert/AckAlertHandler');
const AckAlertDTO = require('../../../../src/pager/application/AckAlert/AckAlertDTO');
const Notification = require('../../../../src/pager/domain/Notification');
const EscalationPolicyTarget = require('../../../../src/pager/domain/EscalationPolicyTarget');
const Alert = require('../../../../src/pager/domain/Alert');

describe('AckAlertHandler', () => {
  describe('given unhealthy monitored service and notification to being process', () => {
    let monitoredServiceRepository;
    let notificationRepository;
    let handler;
    let serviceId;
    let alertToBeAck;
    let anotherServiceNotification;

    beforeEach(async () => {
      monitoredServiceRepository = new MonitoredServiceInMemoryRepository();
      notificationRepository = new NotificationInMemoryRepository();
      handler = createAckAlertHandler({
        monitoredServiceRepository,
        notificationRepository,
      });

      const escalationPolicyTarget = new EscalationPolicyTarget({
        targetId: 8,
        targetType: EscalationPolicyTarget.TYPE.EMAIL,
        targetDestination: 'dave@company.com',
      });

      serviceId = 3;
      alertToBeAck = new Alert({
        serviceId,
        alertMessage: 'Network issue',
        alertEscalationLevel: 1,
        alertOccurredOn: Date.now(),
      });
      const monitoredService = new MonitoredService({
        serviceId,
        escalationPolicyId: 17,
        monitoredServiceAlert: alertToBeAck,
        status: MonitoredService.STATUS.UNHEALTHY,
      });
      await monitoredServiceRepository.save({ monitoredService });

      const anotherServiceAlert = new Alert({
        serviceId: 21,
        alertMessage: 'Server down',
        alertOccurredOn: Date.now(),
      });

      anotherServiceNotification = new Notification({
        notificationId: 'an_id_1',
        notificationTarget: escalationPolicyTarget,
        notificationAlert: anotherServiceAlert,
      });
      const notifications = [
        new Notification({
          notificationId: 'an_id_2',
          notificationTarget: escalationPolicyTarget,
          notificationAlert: alertToBeAck,
        }),
        anotherServiceNotification,
      ];
      await notificationRepository.saveAll({ notifications });
    });

    describe('when receives an ack for the current alert', () => {
      it('then ack the alert and delete notifications for that service', async () => {
        const ackAlertDTO = new AckAlertDTO({
          ackAlertServiceId: serviceId,
        });
        await handler.execute({ ackAlertDTO });

        const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
        const notifications = await notificationRepository.findNotProcessed();

        const alertUpdated = monitoredServiceUpdated.getAlert();
        expect(alertUpdated.getEscalationLevel()).toEqual(alertToBeAck.getEscalationLevel());
        expect(alertUpdated.getAck()).toEqual(true);
        expect(notifications).toEqual([anotherServiceNotification]);
      });
    });
  });

  function createAckAlertHandler({
    monitoredServiceRepository,
    notificationRepository,
  }) {
    const ackAlert = new AckAlert({
      monitoredServiceRepository,
      notificationRepository,
    });
    const handler = new AckAlertHandler({
      ackAlert,
    });
    return handler;
  }
});
