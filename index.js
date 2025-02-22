const functions = require("firebase-functions");
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://todo-task-4d852.web.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = "mongodb+srv://task:kxF19z6agajmz6oj@cluster0.23lvn.mongodb.net";
const client = new MongoClient(uri);
let tasks, users;

const connectDB = async () => {
  await client.connect();
  const db = client.db("taskdb");
  tasks = db.collection("tasks");
  users = db.collection("users");
  console.log("Connected to MongoDB");
};
connectDB();

// Get Tasks for Logged-in User
app.get("/tasks", async (req, res) => {
  const userEmail = req.query.email;
  console.log(userEmail)
  res.json(await tasks.find({email: userEmail}).toArray());
});

// Add Task
// app.post("/tasks", async (req, res) => {
//   await tasks.insertOne(req.body);
//   io.emit("taskUpdated");
//   res.sendStatus(201);
// });
// app.post("/tasks", async (req, res) => {
//   const { email, ...taskData } = req.body;
//   await tasks.insertOne({
//     ...taskData,
//     email,
//   });
//   io.emit("taskUpdated");
//   res.sendStatus(201);
// });

app.post("/tasks", async (req, res) => {
  const { title, description, category, email } = req.body;

  await tasks.insertOne({ title, description, category, email });
  io.emit("taskUpdated");
  res.sendStatus(201);
});



// Update Task
app.put("/tasks/:id", async (req, res) => {
  await tasks.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  io.emit("taskUpdated");
  res.sendStatus(200);
});

// Delete Task
app.delete("/tasks/:id", async (req, res) => {
  await tasks.deleteOne({ _id: new ObjectId(req.params.id) });
  io.emit("taskUpdated");
  res.sendStatus(200);
});

// Store User Data
app.post("/users", async (req, res) => {
  const { userid, email, displayName } = req.body;
  const existingUser = await users.findOne({ email });
  if (!existingUser) await users.insertOne({ userid, email, displayName });
  res.sendStatus(200);
});

server.listen(5000, () => console.log("Server running on port 5000"));
exports.api = functions.https.onRequest(app);