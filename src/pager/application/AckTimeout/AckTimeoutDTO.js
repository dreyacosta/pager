class AckTimeoutDTO {
  static create({ ackTimeoutServiceId }) {
    return new AckTimeoutDTO({ ackTimeoutServiceId });
  }

  constructor({ ackTimeoutServiceId }) {
    this.serviceId = ackTimeoutServiceId;
  }

  getServiceId() {
    return this.serviceId;
  }
}

module.exports = AckTimeoutDTO;
