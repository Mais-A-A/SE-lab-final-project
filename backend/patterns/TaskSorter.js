const DeadlineSortStrategy  = require("./strategies/DeadlineSortStrategy");
const PrioritySortStrategy  = require("./strategies/PrioritySortStrategy");
const DefaultSortStrategy   = require("./strategies/DefaultSortStrategy");

// TaskSorter picks the right strategy based on the sort param
class TaskSorter {
  constructor(sortParam) {
    switch (sortParam) {
      case "deadline": this.strategy = new DeadlineSortStrategy();  break;
      case "priority": this.strategy = new PrioritySortStrategy();  break;
      default:         this.strategy = new DefaultSortStrategy();
    }
  }

  sort(tasks) {
    return this.strategy.sort(tasks);
  }
}

module.exports = TaskSorter;
