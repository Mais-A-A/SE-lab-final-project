// Strategy 2: sort by priority (High → Medium → Low)
class PrioritySortStrategy {
  sort(tasks) {
    const order = { High: 1, Medium: 2, Low: 3 };
    return [...tasks].sort(
      (a, b) => (order[a.priority] || 99) - (order[b.priority] || 99)
    );
  }
}

module.exports = PrioritySortStrategy;
