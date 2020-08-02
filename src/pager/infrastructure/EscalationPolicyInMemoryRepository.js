const EscalationPolicyRepository = require('../domain/EscalationPolicyRepository');

class EscalationPolicyInMemoryRepository extends EscalationPolicyRepository {
  constructor() {
    super();

    this.data = {};
  }

  async save({ escalationPolicy }) {
    this.data[escalationPolicy.getId] = escalationPolicy;
  }
}

module.exports = EscalationPolicyInMemoryRepository;
