class Alert {
  static fromDTO({ alertDTO }) {
    return new Alert({
      serviceId: alertDTO.getServiceId(),
      alertMessage: alertDTO.getMessage(),
      alertOccurredOn: alertDTO.getOccurredOn(),
    });
  }

  constructor({
    serviceId,
    alertEscalationLevel,
    alertAck,
    alertMessage,
    alertOccurredOn,
  }) {
    this.serviceId = serviceId;
    this.escalationLevel = alertEscalationLevel || 0;
    this.ack = alertAck || false;
    this.message = alertMessage;
    this.occurredOn = alertOccurredOn;
  }

  nextEscalationLevelAlert() {
    return new Alert({
      serviceId: this.serviceId,
      alertEscalationLevel: this.escalationLevel + 1,
      alertMessage: this.message,
      alertOccurredOn: this.occurredOn,
    });
  }

  ackAlert() {
    return new Alert({
      serviceId: this.serviceId,
      alertEscalationLevel: this.escalationLevel,
      alertAck: true,
      alertMessage: this.message,
      alertOccurredOn: this.occurredOn,
    });
  }

  getServiceId() {
    return this.serviceId;
  }

  getOccurredOn() {
    return this.occurredOn;
  }

  getMessage() {
    return this.message;
  }

  getEscalationLevel() {
    return this.escalationLevel;
  }

  getAck() {
    return this.ack;
  }
}

module.exports = Alert;
