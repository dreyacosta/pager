class MonitoredService {
  constructor({ serviceId, status }) {
    this.id = serviceId;
    this.status = status || MonitoredService.STATUS.HEALTHY;
  }

  unhealthy() {
    this.status = MonitoredService.STATUS.UNHEALTHY;
  }

  getId() {
    return this.id;
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
