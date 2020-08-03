class AckTimeoutHandler {
  constructor({ ackTimeout }) {
    this.ackTimeout = ackTimeout;
  }

  async execute({ ackTimeoutDTO }) {
    const serviceId = ackTimeoutDTO.getServiceId();
    await this.ackTimeout.execute({ serviceId });
  }
}

module.exports = AckTimeoutHandler;
