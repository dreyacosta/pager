const Notification = require('../../domain/Notification');

class AckTimeout {
  constructor({ monitoredServiceRepository, escalationPolicyRepository, notificationRepository }) {
    this.monitoredServiceRepository = monitoredServiceRepository;
    this.escalationPolicyRepository = escalationPolicyRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ serviceId }) {
    const monitoredService = await this.monitoredServiceRepository.findById({ serviceId });
    if (monitoredService.isHealthy()) {
      return;
    }

    const escalationPolicyId = monitoredService.getEscalationPolicyId();
    const escalationPolicy = await this.escalationPolicyRepository.findById({ escalationPolicyId });
    if (!escalationPolicy) {
      return;
    }

    const alert = monitoredService.getAlert();
    const currentEscalationLevel = alert.getEscalationLevel();

    const targets = escalationPolicy.getTargetsOfLevel(currentEscalationLevel);
    if (targets.length === 0) {
      return;
    }

    const notifications = targets.map((target) => new Notification({
      notificationId: `${target.getId()}_${alert.getOccurredOn()}`,
      notificationTarget: target,
      notificationAlert: alert,
    }));

    await this.notificationRepository.saveAll({ notifications });

    const newAlert = alert.nextEscalationLevelAlert();
    monitoredService.setAlert({ alert: newAlert });

    await this.monitoredServiceRepository.save({ monitoredService });
  }
}

module.exports = AckTimeout;
