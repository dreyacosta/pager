const NotificationRepository = require('../domain/NotificationRepository');

class NotificationInMemoryRepository extends NotificationRepository {
  constructor() {
    super();

    this.data = {};
  }

  async findAll() {
    return Object.values(this.data);
  }

  async findNotProcessed() {
    const notificationsNotProcessed = [];

    Object.entries(this.data).forEach(([, notification]) => {
      if (notification.isProcessed()) {
        return;
      }
      notificationsNotProcessed.push(notification);
    });

    return notificationsNotProcessed;
  }

  async saveAll({ notifications }) {
    notifications.forEach((notification) => {
      this.data[notification.getId()] = notification;
    });
  }

  async deleteByServiceId({ serviceId }) {
    Object.entries(this.data).forEach(([, notification]) => {
      const alert = notification.getAlert();
      if (alert.getServiceId() === serviceId) {
        delete this.data[notification.getId()];
      }
    });
  }

  async drop() {
    this.data = {};
  }
}

module.exports = NotificationInMemoryRepository;
