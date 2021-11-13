const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ga8wg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("flower-garden");
    const flowersCollections = database.collection("flowers");
    const reviewsCollections = database.collection("reviews");
    const ordersCollections = database.collection("orders");
    const usersCollections = database.collection("users");

    // GET Flowers API
    app.get("/flowers", async (req, res) => {
      const cursor = flowersCollections.find({});
      const flowers = await cursor.toArray();

      res.json(flowers);
    });

    // GET SINGLE FLOWER
    app.get("/flowers/:id", async (req, res) => {
      const id = req.params.id;
      console.log("hit request for single service", id);
      const query = { _id: ObjectId(id) };
      const flower = await flowersCollections.findOne(query);
      res.json(flower);
    });

    // DELETE Flowers
    app.delete("/flowers/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await flowersCollections.deleteOne(query);
      res.json(result);
    });

    // POST Products
    app.post("/flowers", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await flowersCollections.insertOne(product);

      res.send(result);
    });

    // GET ORDERS
    app.get("/orders", async (req, res) => {
      const query = req.query;
      console.log(query.email);
      if (query.email) {
        const cursor = ordersCollections.find({ email: query.email });
        const orders = await cursor.toArray();
        res.json(orders);
      } else {
        const cursor = ordersCollections.find({});
        const orders = await cursor.toArray();
        res.json(orders);
      }
    });

    // POST ORDERS
    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await ordersCollections.insertOne(order);
      res.send(result);
    });

    // DELETE ORDERS
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollections.deleteOne(query);
      res.json(result);
    });

    // UPDATE ORDER STATUS
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatestatus = req.body;
      console.log(updatestatus);

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatestatus.status,
        },
      };
      const result = await ordersCollections.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });

    // GET Reviews API
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollections.find({});
      const reviews = await cursor.toArray();

      res.json(reviews);
    });

    // POST REVIEW
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewsCollections.insertOne(review);
      res.send(result);
    });

    // POST USERS
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollections.insertOne(user);
      console.log(result);
      res.json(result);
    });

    // GET ADMIN
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollections.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // MAKE ADMIN
    app.put("/users/makeadmin", async (req, res) => {
      const user = req.body;

      console.log(user);

      if ("admin" === "admin") {
        const filter = { email: user.email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await usersCollections.updateOne(filter, updateDoc);
        console.log("Result", result);
        res.json(result);
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => res.send("Flower Garder is running"));

app.listen(port, () => console.log(`Flower Garder is running on port ${port}`));
