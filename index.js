const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // Add this line
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
// Middleware
app.use(cors({
    origin: ['http://localhost:5173'], // Adjust this to your client URL it must diffent from server URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json())
app.use(cookieParser()) // Add this line


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



// Middleware Creation::

const logger = (req, res, next) => {
    console.log('Called :', req.host, req.originalUrl);
    next();
}





async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // JWT verification middleware
        const verifytoken = (req, res, next) => {
            const token = req.cookies?.token;
            console.log('token from cookie:', token);
            if (!token) return res.status(401).send({ message: 'Unauthorized' });

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    console.log("Error in token verification:", err);
                    return res.status(403).send({ message: 'Forbidden' });
                }
                console.log('Value in the token:', decoded);
                req.decoded = decoded;
                next();
            });

        };

        // Check for ACCESS_TOKEN_SECRET
        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error("⚠️ ACCESS_TOKEN_SECRET is not defined in .env");
        }




        // Auth Related APIs
        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            console.log(user);

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res
                .cookie('token', token, {
                    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                    secure: false,
                    sameSite: 'lax'
                })
                .send({ success: true, })
            // res.send(token);
        })

        //         require('crypto').randomBytes(64).toString('hex')








        //Service Related APIs

        const serviceCollection = client.db("carDoctor").collection("services");
        const checkoutCollection = client.db("carDoctor").collection("checkouts");
        //use it in an api endpoint
        app.get('/services', logger, async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // find a single service by id
        app.get('/services/:id', logger, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        });
        //find who login user
        //find who login user (protected route)
        app.get('/checkout', verifytoken, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'Forbidden access' });
            }

            const result = await checkoutCollection.find({ email }).toArray();
            res.send(result);
        });


        // checkout collection api
        app.post('/checkout', logger, verifytoken, async (req, res) => {
            const checkout = req.body;

            const result = await checkoutCollection.insertOne(checkout);
            res.send(result);
        })
        // delete checkout api
        app.delete('/checkout/:id', logger, verifytoken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await checkoutCollection.deleteOne(query);
            res.send(result);

        });
        // update checkout api
        app.patch('/checkout/:id', logger, verifytoken, async (req, res) => {
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
