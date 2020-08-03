class AckAlert {
  constructor({ monitoredServiceRepository, notificationRepository }) {
    this.monitoredServiceRepository = monitoredServiceRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ serviceId }) {
    const monitoredService = await this.monitoredServiceRepository.findById({ serviceId });

    const alert = monitoredService.getAlert();
    const newAlert = alert.ackAlert();
    monitoredService.setAlert({ alert: newAlert });

    await this.monitoredServiceRepository.save({ monitoredService });
    await this.notificationRepository.deleteByServiceId({ serviceId });
  }
}

module.exports = AckAlert;
