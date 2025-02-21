const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
require("dotenv").config();
const port = process.env.PORT || 5000;
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

//middlewares
app.use(cors());
app.use(express.json());

// database connection

const {
  MongoClient,
  ServerApiVersion,
  ConnectionCheckOutStartedEvent,
  ObjectId,
} = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.23lvn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // ----------------
    // my code here
    const taskCollection = client.db("taskList").collection("task");
    const userCollection = client.db("taskList").collection("users");
    // add user data to the database
    // user data store api 
    app.post('/users', async(req, res)=>{
      const {userid, email, displayName} = req.body;
      const user = {userid, email, displayName}
      const existingUser = await userCollection.findOne({email})
      if(!existingUser){
        await userCollection.insertOne(user)
      }
      res.sendStatus(200);
    })

  //  get task data 
  app.get('/tasks', async(req,res)=>{
    const {email} = req.query;
    const result = await taskCollection.find({email}).toArray();
    res.send(result)
  }) 

  // add task 
  app.post('/tasks', async(req,res)=>{
    const task = req.body;
    await taskCollection.insertOne(task)
    io.emit("taskUpdate")
    res.sendStatus(201)
  })

  // update task 
  app.put("/tasks/:id", async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    await taskCollection.updateOne(query,{$set: req.body})
    io.emit("taskUpdated")
    res.sendStatus(200)
  })
    // delete task 
  app.delete("/tasks/:id", async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    await taskCollection.deleteOne(query)
    io.emit("taskUpdated")
    res.sendStatus(200)
  })


    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

server.listen(port, () => {
  console.log("server in running on port", port);
});
