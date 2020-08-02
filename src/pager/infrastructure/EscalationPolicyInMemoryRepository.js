const EscalationPolicyRepository = require('../domain/EscalationPolicyRepository');

class EscalationPolicyInMemoryRepository extends EscalationPolicyRepository {
  constructor() {
    super();

    this.data = {};
  }

  async save({ escalationPolicy }) {
    this.data[escalationPolicy.getId()] = escalationPolicy;
  }

  async findById({ escalationPolicyId }) {
    const escalationPolicy = this.data[escalationPolicyId];
    return escalationPolicy;
  }
}

module.exports = EscalationPolicyInMemoryRepository;
