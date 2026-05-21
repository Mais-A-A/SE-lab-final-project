const express = require("express");
const cors = require("cors");
const tasksRouter = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/tasks", tasksRouter);

if (require.main === module) {
  app.listen(3001, () => {
    console.log("Backend running on http://localhost:3001");
  });
}

module.exports = app;