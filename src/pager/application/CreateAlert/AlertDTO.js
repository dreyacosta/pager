class AlertDTO {
  static create({ serviceId, alertMessage, alertOccurredOn }) {
    return new AlertDTO({ serviceId, alertMessage, alertOccurredOn });
  }

  constructor({ serviceId, alertMessage, alertOccurredOn }) {
    this.serviceId = serviceId;
    this.message = alertMessage;
    this.occurredOn = alertOccurredOn;
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
