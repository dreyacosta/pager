const NotificationRepository = require('../domain/NotificationRepository');

class NotificationInMemoryRepository extends NotificationRepository {
  constructor() {
    super();

    this.data = {};
  }

  async findAll() {
    return Object.values(this.data);
  }

  async saveAll({ notifications }) {
    notifications.forEach((notification) => {
      this.data[notification.getId()] = notification;
    });
  }
}

module.exports = NotificationInMemoryRepository;
