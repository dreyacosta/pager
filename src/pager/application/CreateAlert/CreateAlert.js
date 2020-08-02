const Notification = require('../../domain/Notification');

class CreateAlert {
  constructor({ monitoredServiceRepository, escalationPolicyRepository, notificationRepository }) {
    this.monitoredServiceRepository = monitoredServiceRepository;
    this.escalationPolicyRepository = escalationPolicyRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ alert }) {
    const serviceId = alert.getServiceId();
    const monitoredService = await this.monitoredServiceRepository.findById({ serviceId });

    monitoredService.unhealthy();

    const escalationPolicyId = monitoredService.getEscalationPolicyId();
    const escalationPolicy = await this.escalationPolicyRepository.findById({ escalationPolicyId });

    const targets = escalationPolicy.getTargetsOfLevel(1);
    const notifications = targets.map((target) => new Notification({
      notificationId: `${target.getId()}_${alert.getOccurredOn()}`,
      notificationTarget: target,
      notificationAlert: alert,
    }));

    await this.notificationRepository.saveAll({ notifications });
    await this.monitoredServiceRepository.save({ monitoredService });
  }
}

module.exports = CreateAlert;
