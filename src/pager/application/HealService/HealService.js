class HealService {
  constructor({ monitoredServiceRepository, notificationRepository }) {
    this.monitoredServiceRepository = monitoredServiceRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ serviceId }) {
    const monitoredService = await this.monitoredServiceRepository.findById({ serviceId });

    monitoredService.healthy();

    await this.monitoredServiceRepository.save({ monitoredService });
    await this.notificationRepository.deleteByServiceId({ serviceId });
  }
}

module.exports = HealService;
