class Alert {
  static fromDTO({ alertDTO }) {
    return new Alert({
      alertId: alertDTO.getId(),
      serviceId: alertDTO.getServiceId(),
      alertMessage: alertDTO.getMessage(),
      alertOccurredOn: alertDTO.getOccurredOn(),
    });
  }

  constructor({ alertId, serviceId, alertMessage, alertOccurredOn }) {
    this.id = alertId;
    this.serviceId = serviceId;
    this.message = alertMessage;
    this.occurredOn = alertOccurredOn;
  }

  getServiceId() {
    return this.serviceId;
  }
}

module.exports = Alert;
