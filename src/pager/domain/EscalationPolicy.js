class EscalationPolicy {
  constructor({ escalationPolicyId, escalationPolicyLevels }) {
    this.id = escalationPolicyId;
    this.levels = escalationPolicyLevels;
  }

  getId() {
    return this.id;
  }

  getTargetsOfLevel(levelNumber) {
    const level = this.levels[levelNumber - 1];
    if (!level) {
      return [];
    }

    return level.getTargets();
  }
}

module.exports = EscalationPolicy;
