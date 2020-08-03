class AckAlertDTO {
  constructor({ ackAlertServiceId }) {
    this.serviceId = ackAlertServiceId;
  }

  getServiceId() {
    return this.serviceId;
  }
}

module.exports = AckAlertDTO;
