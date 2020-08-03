const Alert = require('../../domain/Alert');

class CreateAlertHandler {
  constructor({ createAlert }) {
    this.createAlert = createAlert;
  }

  async execute({ alertDTO }) {
    const alert = new Alert({
      serviceId: alertDTO.getServiceId(),
      alertMessage: alertDTO.getMessage(),
      alertOccurredOn: alertDTO.getOccurredOn(),
    });
    await this.createAlert.execute({ alert });
  }
}

module.exports = CreateAlertHandler;
