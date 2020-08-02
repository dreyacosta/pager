class CreateAlert {
  constructor({ monitoredServiceRepository }) {
    this.monitoredServiceRepository = monitoredServiceRepository;
  }

  async execute({ alert }) {
    const serviceId = alert.getServiceId();
    const monitoredService = await this.monitoredServiceRepository.findById({ serviceId });

    monitoredService.unhealthy();

    await this.monitoredServiceRepository.save({ monitoredService });
  }
}

module.exports = CreateAlert;
