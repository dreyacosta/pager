class AlertDTO {
  static create({ alertId, serviceId, alertMessage, alertOccuredOn }) {
    return new AlertDTO({ alertId, serviceId, alertMessage, alertOccuredOn });
  }

  constructor({ alertId, serviceId, alertMessage, alertOccuredOn }) {
    this.id = alertId;
    this.serviceId = serviceId;
    this.message = alertMessage;
    this.occurredOn = alertOccuredOn;
  }

  getId() {
    return this.id;
  }

  getServiceId() {
    return this.serviceId;
  }

  getMessage() {
    return this.message;
  }

  getOccurredOn() {
    return this.occurredOn;
  }
}

module.exports = AlertDTO;
