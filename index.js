const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
// Middleware
app.use(cors());
app.use(express.json())


// nodemon index.js



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.9p6xc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceCollection = client.db("carDoctor").collection("services");
        const checkoutCollection = client.db("carDoctor").collection("checkouts");
        //use it in an api endpoint
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // find a single service by id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        });
        //find who login user
        app.get('/checkout', async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) {
                query = { email: email };
            }

            const result = await checkoutCollection.find(query).toArray();
            res.send(result);
        });


        // checkout collection api
        app.post('/checkout', async (req, res) => {
            const checkout = req.body;
            const result = await checkoutCollection.insertOne(checkout);
            res.send(result);
        })
        // delete checkout api
        app.delete('/checkout/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await checkoutCollection.deleteOne(query);
            res.send(result);
        });
        // update checkout api
        app.patch('/checkout/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body; // { date: "new date", message: "new message" }

            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: updateData,
            };

            const result = await checkoutCollection.updateOne(query, updateDoc);
            res.send(result);
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);











app.get('/', (req, res) => {
    res.send('Car Doctor Server is running')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
