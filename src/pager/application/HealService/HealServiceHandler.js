class HealServiceHandler {
  constructor({ healService }) {
    this.healService = healService;
  }

  async execute({ healServiceDTO }) {
    const serviceId = healServiceDTO.getServiceId();
    await this.healService.execute({ serviceId });
  }
}

module.exports = HealServiceHandler;
