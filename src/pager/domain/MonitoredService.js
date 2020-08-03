class MonitoredService {
  constructor({ serviceId, escalationPolicyId, monitoredServiceAlert, status }) {
    this.id = serviceId;
    this.escalationPolicyId = escalationPolicyId;
    this.status = status || MonitoredService.STATUS.HEALTHY;
    this.alert = monitoredServiceAlert;
  }

  setAlert({ alert }) {
    this.alert = alert;
  }

  healthy() {
    this.status = MonitoredService.STATUS.HEALTHY;
  }

  unhealthy() {
    this.status = MonitoredService.STATUS.UNHEALTHY;
  }

  isUnhealthy() {
    return this.status === MonitoredService.STATUS.UNHEALTHY;
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

  getAlert() {
    return this.alert;
  }
}

MonitoredService.STATUS = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
};

module.exports = MonitoredService;
