class Alert {
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
