class AlertDTO {
  static create({ alertId, serviceId, alertMessage, alertOccuredOn }) {
    return new AlertDTO({ alertId, serviceId, alertMessage, alertOccuredOn });
  }

  constructor({ alertId, serviceId, alertMessage, alertOccuredOn }) {
    this.id = alertId;
    this.serviceId = serviceId;
    this.message = alertMessage;
    this.ocurredOn = alertOccuredOn;
  }
}

module.exports = AlertDTO;
