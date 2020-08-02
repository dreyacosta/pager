class MonitoredService {
  constructor({ serviceId, escalationPolicyId, status }) {
    this.id = serviceId;
    this.escalationPolicyId = escalationPolicyId;
    this.status = status || MonitoredService.STATUS.HEALTHY;
  }

  unhealthy() {
    this.status = MonitoredService.STATUS.UNHEALTHY;
  }

  getId() {
    return this.id;
  }

  getEscalationPolicyId() {
    return this.escalationPolicyId;
  }

  getStatus() {
    return this.status;
  }
}

MonitoredService.STATUS = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
};

module.exports = MonitoredService;
