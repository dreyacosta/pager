class HealServiceDTO {
  static create({ serviceId }) {
    return new HealServiceDTO({
      serviceId,
    });
  }

  constructor({ serviceId }) {
    this.serviceId = serviceId;
  }

  getServiceId() {
    return this.serviceId;
  }
}

module.exports = HealServiceDTO;
