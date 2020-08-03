class AckAlertHandler {
  constructor({ ackAlert }) {
    this.ackAlert = ackAlert;
  }

  async execute({ ackAlertDTO }) {
    const serviceId = ackAlertDTO.getServiceId();
    await this.ackAlert.execute({ serviceId });
  }
}

module.exports = AckAlertHandler;
