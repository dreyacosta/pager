class EscalationPolicyTarget {
  constructor({ targetId, targetType, targetDestination }) {
    this.id = targetId;
    this.type = targetType;
    this.destination = targetDestination;
  }

  isEmail() {
    return this.type === EscalationPolicyTarget.TYPE.EMAIL;
  }

  isSms() {
    return this.type === EscalationPolicyTarget.TYPE.SMS;
  }

  getId() {
    return this.id;
  }

  getDestination() {
    return this.destination;
  }
}

EscalationPolicyTarget.TYPE = {
  EMAIL: 'email',
  SMS: 'sms',
};

module.exports = EscalationPolicyTarget;
