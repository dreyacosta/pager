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
    if (monitoredService.isUnhealthy()) {
      return;
    }

    monitoredService.unhealthy();
    monitoredService.setAlert({ alert });

    const escalationPolicyId = monitoredService.getEscalationPolicyId();
    const escalationPolicy = await this.escalationPolicyRepository.findById({ escalationPolicyId });
    if (!escalationPolicy) {
      return;
    }

    const targets = escalationPolicy.getTargetsOfLevel(alert.getEscalationLevel());
    const notifications = targets.map((target) => new Notification({
      notificationId: `${target.getId()}_${alert.getOccurredOn()}`,
      notificationTarget: target,
      notificationAlert: alert,
    }));

    const newAlert = alert.nextEscalationLevelAlert();
    monitoredService.setAlert({ alert: newAlert });

    await this.notificationRepository.saveAll({ notifications });
    await this.monitoredServiceRepository.save({ monitoredService });
  }
}

module.exports = CreateAlert;
