const MonitoredServiceInMemoryRepository = require('../../../../src/pager/infrastructure/MonitoredServiceInMemoryRepository');
const EscalationPolicyInMemoryRepository = require('../../../../src/pager/infrastructure/EscalationPolicyInMemoryRepository');
const MonitoredService = require('../../../../src/pager/domain/MonitoredService');
const Alert = require('../../../../src/pager/domain/Alert');
const EscalationPolicy = require('../../../../src/pager/domain/EscalationPolicy');
const EscalationPolicyLevel = require('../../../../src/pager/domain/EscalationPolicyLevel');
const EscalationPolicyTarget = require('../../../../src/pager/domain/EscalationPolicyTarget');
const AckTimeout = require('../../../../src/pager/application/AckTimeout/AckTimeout');
const AckTimeoutHandler = require('../../../../src/pager/application/AckTimeout/AckTimeoutHandler');
const AckTimeoutDTO = require('../../../../src/pager/application/AckTimeout/AckTimeoutDTO');
const NotificationInMemoryRepository = require('../../../../src/pager/infrastructure/NotificationInMemoryRepository');
const Notification = require('../../../../src/pager/domain/Notification');

describe('AckTimeoutHandler', () => {
  describe('given an unhealthy monitored service, alert is not ack', () => {
    let monitoredServiceRepository;
    let escalationPolicyRepository;
    let notificationRepository;
    let handler;
    let serviceId;
    let escalationPolicyTargetLevelTwo;
    let monitoredServiceAlert;

    beforeEach(async () => {
      monitoredServiceRepository = new MonitoredServiceInMemoryRepository();
      escalationPolicyRepository = new EscalationPolicyInMemoryRepository();
      notificationRepository = new NotificationInMemoryRepository();

      handler = createAckTimeoutHandler({
        monitoredServiceRepository,
        escalationPolicyRepository,
        notificationRepository,
      });

      escalationPolicyTargetLevelTwo = anSmsEscalationPolicyTarget();
      const escalationPolicyLevelTwo = anEscalationPolicyLevelWithTarget({
        target: escalationPolicyTargetLevelTwo,
      });
      const escalationPolicyId = 12;
      const escalationPolicy = new EscalationPolicy({
        escalationPolicyId,
        escalationPolicyLevels: [
          anEscalationPolicyLevelWithTarget({
            target: anEmailEscalationPolicyTarget(),
          }),
          escalationPolicyLevelTwo,
        ],
      });
      await escalationPolicyRepository.save({ escalationPolicy });

      serviceId = 32;
      monitoredServiceAlert = anAlert({ serviceId, alertEscalationLevel: 1 });
      const monitoredService = new MonitoredService({
        serviceId,
        escalationPolicyId,
        monitoredServiceAlert,
        status: MonitoredService.STATUS.UNHEALTHY,
      });
      await monitoredServiceRepository.save({ monitoredService });
    });

    describe('when receives an ack timeout for that service', () => {
      it('then creates notifications for targets of the next level and creates new alert', async () => {
        const ackTimeoutDTO = AckTimeoutDTO.create({
          ackTimeoutServiceId: serviceId,
        });

        await handler.execute({ ackTimeoutDTO });

        const notifications = await notificationRepository.findAll();
        expect(notifications).toEqual([
          new Notification({
            notificationId: `${escalationPolicyTargetLevelTwo.getId()}_${monitoredServiceAlert.getOccurredOn()}`,
            notificationAlert: monitoredServiceAlert,
            notificationTarget: escalationPolicyTargetLevelTwo,
          }),
        ]);
      });
    });

    describe('when receives two ack timeout for that service', () => {
      it('then only creates notifications for targets of existing levels', async () => {
        const ackTimeoutDTO = AckTimeoutDTO.create({
          ackTimeoutServiceId: serviceId,
        });

        await handler.execute({ ackTimeoutDTO });
        await handler.execute({ ackTimeoutDTO });

        const notifications = await notificationRepository.findAll();
        expect(notifications).toEqual([
          new Notification({
            notificationId: `${escalationPolicyTargetLevelTwo.getId()}_${monitoredServiceAlert.getOccurredOn()}`,
            notificationAlert: monitoredServiceAlert,
            notificationTarget: escalationPolicyTargetLevelTwo,
          }),
        ]);
      });
    });
  });

  describe('given a healthy monitored service', () => {
    let monitoredServiceRepository;
    let notificationRepository;
    let serviceId;
    let escalationPolicyId;
    let monitoredServiceAlert;
    let handler;

    beforeEach(async () => {
      monitoredServiceRepository = new MonitoredServiceInMemoryRepository();
      const escalationPolicyRepository = new EscalationPolicyInMemoryRepository();
      notificationRepository = new NotificationInMemoryRepository();

      handler = createAckTimeoutHandler({
        monitoredServiceRepository,
        escalationPolicyRepository,
        notificationRepository,
      });

      escalationPolicyId = 3;
      const escalationPolicy = new EscalationPolicy({
        escalationPolicyId,
        escalationPolicyLevels: [
          anEscalationPolicyLevelWithTarget({
            target: anEmailEscalationPolicyTarget(),
          }),
        ],
      });
      await escalationPolicyRepository.save({ escalationPolicy });

      serviceId = 32;
      monitoredServiceAlert = anAlert({ serviceId, alertEscalationLevel: 0 });
      const monitoredService = new MonitoredService({
        serviceId,
        escalationPolicyId,
        monitoredServiceAlert,
        status: MonitoredService.STATUS.HEALTHY,
      });
      await monitoredServiceRepository.save({ monitoredService });
    });

    describe('when receives ack timeout for that service', () => {
      it('then ignores the timeout', async () => {
        const ackTimeoutDTO = AckTimeoutDTO.create({
          ackTimeoutServiceId: serviceId,
        });

        await handler.execute({ ackTimeoutDTO });

        const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
        const notifications = await notificationRepository.findAll();
        expect(monitoredServiceUpdated.getStatus()).toEqual(MonitoredService.STATUS.HEALTHY);
        expect(monitoredServiceUpdated.getAlert()).toEqual(monitoredServiceAlert);
        expect(notifications).toEqual([]);
      });
    });

    describe('and an acked alert', () => {
      let ackAlert;

      beforeEach(async () => {
        ackAlert = new Alert({
          serviceId,
          alertAck: true,
          alertEscalationLevel: 0,
          alertMessage: 'Service down',
          alertOccurredOn: Date.now(),
        });
        const monitoredService = new MonitoredService({
          serviceId,
          escalationPolicyId,
          monitoredServiceAlert: ackAlert,
          status: MonitoredService.STATUS.UNHEALTHY,
        });
        await monitoredServiceRepository.save({ monitoredService });
      });

      describe('when receives ack timeout for that service', () => {
        it('then ignores the timeout', async () => {
          const ackTimeoutDTO = AckTimeoutDTO.create({
            ackTimeoutServiceId: serviceId,
          });

          await handler.execute({ ackTimeoutDTO });

          const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
          const notifications = await notificationRepository.findAll();
          expect(monitoredServiceUpdated.getStatus()).toEqual(MonitoredService.STATUS.UNHEALTHY);
          expect(monitoredServiceUpdated.getAlert()).toEqual(ackAlert);
          expect(notifications).toEqual([]);
        });
      });
    });
  });

  function anAlert({ serviceId, alertEscalationLevel }) {
    return new Alert({
      serviceId,
      alertAck: false,
      alertEscalationLevel,
      alertMessage: 'Service down',
      alertOccurredOn: Date.now(),
    });
  }

  function anEmailEscalationPolicyTarget() {
    return new EscalationPolicyTarget({
      targetId: 1,
      targetType: EscalationPolicyTarget.TYPE.EMAIL,
      targetDestination: 'mike@company.com',
    });
  }

  function anSmsEscalationPolicyTarget() {
    return new EscalationPolicyTarget({
      targetId: 2,
      targetType: EscalationPolicyTarget.TYPE.SMS,
      targetDestination: '+12025550102',
    });
  }

  function createAckTimeoutHandler({
    monitoredServiceRepository,
    escalationPolicyRepository,
    notificationRepository,
  }) {
    const ackTimeout = new AckTimeout({
      monitoredServiceRepository,
      escalationPolicyRepository,
      notificationRepository,
    });
    const handler = new AckTimeoutHandler({
      ackTimeout,
    });
    return handler;
  }

  function anEscalationPolicyLevelWithTarget({ target }) {
    return new EscalationPolicyLevel({
      escalationPolicyLevelTargets: [
        target,
      ],
    });
  }
});
