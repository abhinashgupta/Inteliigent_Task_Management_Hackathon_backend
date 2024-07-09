const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const taskRoutes = require("./routes/tasks");
const Task = require("./models/Task")

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Socket.io
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Example: Emit a message to the client
  socket.emit("welcome", "Welcome to the server!");

  // Handle task updates
  socket.on("updateTask", async (updatedTask) => {
    try {
      // Assuming you have a Task model in MongoDB
      await Task.findOneAndUpdate(
        { _id: updatedTask._id },
        { $set: updatedTask },
        { new: true }
      );

      io.emit("taskUpdate", updatedTask); // Broadcast updated task to all clients
      io.emit("notification", {
        type: "update",
        message: `Task '${updatedTask.name}' has been updated.`,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  });

  // Handle new task creation
  socket.on("createTask", async (newTask) => {
    try {
      // Create new task
      const createdTask = await Task.create(newTask);

      io.emit("taskCreated", createdTask); // Broadcast new task to all clients
      io.emit("notification", {
        type: "create",
        message: `New task '${createdTask.name}' has been created.`,
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  });

  // Handle task deletion
  socket.on("deleteTask", async (taskId) => {
    try {
      await Task.findByIdAndDelete(taskId);

      io.emit("taskDeleted", taskId); // Broadcast task deletion to all clients
      io.emit("notification", {
        type: "delete",
        message: `Task with ID '${taskId}' has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  });
});

// Routes
app.use("/api", taskRoutes);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
