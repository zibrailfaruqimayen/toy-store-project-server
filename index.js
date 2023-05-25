const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//  middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hhzare7.mongodb.net/?retryWrites=true&w=majority`;

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

    const toyCollection = client.db("toyDB").collection("toy");

    // limited data
    app.get("/allToys", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = page * limit;

      const result = await toyCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send(result);
    });

    // add toy
    app.get("/addToy", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      let sortOption = req.query.sort;
      let sortQuery = {};

      if (sortOption === "highToLow") {
        sortQuery = { price: -1 };
      } else if (sortOption === "lowToHigh") {
        sortQuery = { price: 1 };
      }
      const result = await toyCollection
        .find(query)
        .sort(sortQuery)
        .map((toy) => ({ ...toy, price: parseFloat(toy.price) }))
        .toArray();
      res.send(result);
    });

    //  data adding
    app.post("/addToy", async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      res.send(result);
      console.log(body);
    });

    // category data
    app.get("/allToy/:category", async (req, res) => {
      if (
        req.params.category == "police" ||
        req.params.category == "truck" ||
        req.params.category == "sports"
      ) {
        const result = await toyCollection
          .find({ category: req.params.category })
          .toArray();
        return res.send(result);
      }

      const result = await toyCollection.find().toArray();
      res.send(result);
    });

    app.get("/addToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // update data
    app.patch("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/addToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/totalToys", async (req, res) => {
      const result = await toyCollection.estimatedDocumentCount();
      res.send({ totalToys: result });
    });

    // Send a ping to confirm a successful connection

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
  res.send("toy store running");
});

app.listen(port, () => {
  console.log(`toy store server running on port ${port}`);
});
