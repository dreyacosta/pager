const MonitoredServiceRepository = require('../domain/MonitoredServiceRepository');

class MonitoredServiceInMemoryRepository extends MonitoredServiceRepository {
  constructor() {
    super();

    this.data = {};
  }

  async save({ monitoredService }) {
    this.data[monitoredService.getId()] = monitoredService;
  }

  async findById({ serviceId }) {
    const monitoredService = this.data[serviceId];
    return monitoredService;
  }
}

module.exports = MonitoredServiceInMemoryRepository;
