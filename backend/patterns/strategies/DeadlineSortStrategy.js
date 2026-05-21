// Strategy 1: sort by deadline (nearest first)
class DeadlineSortStrategy {
  sort(tasks) {
    return [...tasks].sort(
      (a, b) => new Date(a.deadline || "9999") - new Date(b.deadline || "9999")
    );
  }
}

module.exports = DeadlineSortStrategy;
