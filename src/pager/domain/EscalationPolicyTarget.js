class EscalationPolicyTarget {
  constructor({ targetId, targetType, targetDestination }) {
    this.id = targetId;
    this.type = targetType;
    this.destination = targetDestination;
  }

  getId() {
    return this.id;
  }
}

EscalationPolicyTarget.TYPE = {
  EMAIL: 'email',
  SMS: 'sms',
};

module.exports = EscalationPolicyTarget;
