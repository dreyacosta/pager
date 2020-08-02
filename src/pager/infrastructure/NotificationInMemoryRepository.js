const NotificationRepository = require('../domain/NotificationRepository');

class NotificationInMemoryRepository extends NotificationRepository {
  async findAll() {
    return [];
  }
}

module.exports = NotificationInMemoryRepository;
