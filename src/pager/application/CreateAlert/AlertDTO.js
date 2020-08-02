class AlertDTO {
  static create({ alertId, serviceId, alertMessage, alertOccurredOn }) {
    return new AlertDTO({ alertId, serviceId, alertMessage, alertOccurredOn });
  }

  constructor({ alertId, serviceId, alertMessage, alertOccurredOn }) {
    this.id = alertId;
    this.serviceId = serviceId;
    this.message = alertMessage;
    this.occurredOn = alertOccurredOn;
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
