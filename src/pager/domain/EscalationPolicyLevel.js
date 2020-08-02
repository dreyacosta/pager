class EscalationPolicyLevel {
  constructor({ escalationPolicyLevelTargets }) {
    this.targets = escalationPolicyLevelTargets;
  }

  getTargets() {
    return this.targets;
  }
}

module.exports = EscalationPolicyLevel;
